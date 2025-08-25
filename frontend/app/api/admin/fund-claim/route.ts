import { NextResponse } from "next/server";
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Keep conversion consistent with frontend/lib/blockchain.ts
const APT_DECIMALS = 100000000; // 1 APT = 10^8 Octas

async function getAdminAccount(): Promise<Account> {
	let privateKeyHex = process.env.ADMIN_PRIVATE_KEY_HEX || "";
	if (!privateKeyHex) {
		try {
			const fs = await import("fs/promises");
			const path = "E:/aptoss/contracts/new-contract-key";
			privateKeyHex = (await fs.readFile(path, "utf8")).trim();
		} catch (error) {
			console.error("Failed to read private key file:", error);
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
	
	console.log("🔑 Using admin private key (first 8 chars):", privateKeyHex.slice(0, 10) + "...");
	
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
		const { userAddress, amountOctas } = body as {
			userAddress: string;
			amountOctas: number;
		};

		if (!userAddress || !amountOctas || amountOctas <= 0) {
			return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
		}

		const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));
		const admin = await getAdminAccount();

		console.log("💰 Admin Fund Transfer Starting:", {
			adminAddress: admin.accountAddress.toString(),
			userAddress,
			amountOctas,
			amountAPT: (amountOctas / APT_DECIMALS).toFixed(4),
		});

		// Ensure admin has funds (Devnet faucet) - fund with more APT
		try {
			await aptos.fundAccount({ accountAddress: admin.accountAddress, amount: 200_000_000 }); // 2 APT
			console.log("✅ Admin account funded via faucet");
		} catch (faucetError) {
			console.log("⚠️ Faucet funding failed, continuing with existing balance:", faucetError);
		}

		// Check admin balance before transfer
		try {
			const adminBalance = await aptos.getAccountAPTAmount({ accountAddress: admin.accountAddress });
			console.log("💳 Admin balance before transfer:", (adminBalance / APT_DECIMALS).toFixed(4), "APT");
		} catch (_) {}

		// Transfer from admin to user
		const transaction = await aptos.transaction.build.simple({
			sender: admin.accountAddress,
			data: {
				function: "0x1::coin::transfer",
				typeArguments: ["0x1::aptos_coin::AptosCoin"],
				functionArguments: [userAddress, BigInt(amountOctas)],
			},
		});

		console.log("📤 Submitting transfer transaction...");
		const committed = await aptos.signAndSubmitTransaction({ signer: admin, transaction });
		console.log("⏳ Waiting for transaction confirmation...");
		await aptos.waitForTransaction({ transactionHash: committed.hash });
		
		console.log("✅ Transfer completed successfully!");

		// Check balances after transfer
		try {
			const adminBalanceAfter = await aptos.getAccountAPTAmount({ accountAddress: admin.accountAddress });
			const userBalanceAfter = await aptos.getAccountAPTAmount({ accountAddress: userAddress });
			console.log("💳 Final balances:", {
				admin: (adminBalanceAfter / APT_DECIMALS).toFixed(4) + " APT",
				user: (userBalanceAfter / APT_DECIMALS).toFixed(4) + " APT"
			});
		} catch (_) {}

		return NextResponse.json({
			success: true,
			txHash: committed.hash,
			userAddress,
			amountOctas,
			amountAPT: (amountOctas / APT_DECIMALS).toFixed(4),
			adminAddress: admin.accountAddress.toString(),
		});
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
	}
}
