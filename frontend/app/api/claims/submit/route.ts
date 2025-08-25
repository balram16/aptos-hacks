import { NextResponse } from "next/server";
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import type { FraudAnalysisRequest } from "@/lib/fraud-detection";
import fraudDetectionAPI, { getClaimStatusFromScore } from "@/lib/fraud-detection";

// Keep conversion consistent with frontend/lib/blockchain.ts
const APT_DECIMALS = 100000000; // 1 APT = 10^8 Octas
const INR_TO_APT_RATE = 1000000; // 1 APT = 10 INR (simplified)

function convertINRToAPT(inrAmount: number): number {
	return Math.floor((inrAmount * APT_DECIMALS) / INR_TO_APT_RATE);
}

async function getAdminAccount(): Promise<Account> {
	let privateKeyHex = process.env.ADMIN_PRIVATE_KEY_HEX || "";
	if (!privateKeyHex) {
		try {
			// Attempt to read from local contracts key file during development
			const fs = await import("fs/promises");
			const path = "E:/aptoss/contracts/new-contract-key";
			privateKeyHex = (await fs.readFile(path, "utf8")).trim();
		} catch (error) {
			console.error("❌ Failed to read private key file:", error);
		}
	}
	if (!privateKeyHex) {
		throw new Error("Admin private key not configured. Set ADMIN_PRIVATE_KEY_HEX or ensure contracts/new-contract-key exists.");
	}
	
	// Clean up the private key - remove any whitespace and ensure proper format
	privateKeyHex = privateKeyHex.trim().replace(/\s+/g, '');
	
	// Remove 0x prefix if present, then add it back
	if (privateKeyHex.startsWith("0x")) {
		privateKeyHex = privateKeyHex.slice(2);
	}
	
	// Validate hex string length (should be 64 characters for Ed25519)
	if (privateKeyHex.length !== 64) {
		throw new Error(`Invalid private key length: ${privateKeyHex.length}. Expected 64 hex characters.`);
	}
	
	// Validate hex characters
	if (!/^[0-9A-Fa-f]+$/.test(privateKeyHex)) {
		throw new Error("Private key contains invalid hex characters.");
	}
	
	// Add 0x prefix for Ed25519PrivateKey
	privateKeyHex = "0x" + privateKeyHex;
	
	try {
		const privateKey = new Ed25519PrivateKey(privateKeyHex);
		return Account.fromPrivateKey({ privateKey });
	} catch (error) {
		throw new Error(`Failed to create account from private key: ${error}`);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {
			policyId,
			userAddress,
			claimAmountINR,
			fraudPayload,
		} = body as {
			policyId: string;
			userAddress: string;
			claimAmountINR: number;
			fraudPayload?: FraudAnalysisRequest;
		};

		if (!policyId || !userAddress || !claimAmountINR || claimAmountINR <= 0) {
			return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
		}

		// 1) Run fraud analysis (real API if available, else fallback to mock)
		let aggregateScore: number;
		try {
			if (fraudPayload) {
				const result = await fraudDetectionAPI.analyzeFraudRisk(fraudPayload);
				aggregateScore = result.aggregate_score;
			} else {
				const mock = fraudDetectionAPI.generateMockAnalysis(claimAmountINR, policyId);
				aggregateScore = mock.aggregate_score;
			}
		} catch (e) {
			// Fallback to mock on API failure
			const mock = fraudDetectionAPI.generateMockAnalysis(claimAmountINR, policyId);
			aggregateScore = mock.aggregate_score;
		}

		const status = getClaimStatusFromScore(aggregateScore); // APPROVED | PENDING | REJECTED

		// Return analysis result - frontend will handle wallet transactions
		return NextResponse.json({
			success: true,
			policyId,
			userAddress,
			claimAmountINR,
			aggregateScore,
			status,
			requiresTransfer: status === "APPROVED",
			transferAmount: status === "APPROVED" ? convertINRToAPT(claimAmountINR) : 0,
		});
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
	}
}


