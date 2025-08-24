import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Type declaration for Petra wallet
declare global {
  interface Window {
    aptos: any;
  }
}

// Contract address for devnet
export const CONTRACT_ADDRESS = "0x7db1a4673c2c6a1c3031c16410ee916af2b3fcd809ba5b92ce920bcca202679f";

// Initialize Aptos client for devnet
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

// Role constants - like FarmAssure
export const ROLE_UNREGISTERED = 0;
export const ROLE_POLICYHOLDER = 1; 
export const ROLE_ADMIN = 2;

// Policy type constants
export const POLICY_TYPE_HEALTH = 1;
export const POLICY_TYPE_LIFE = 2;
export const POLICY_TYPE_AUTO = 3;
export const POLICY_TYPE_HOME = 4;
export const POLICY_TYPE_TRAVEL = 5;

// Policy status constants
export const POLICY_STATUS_ACTIVE = 1;
export const POLICY_STATUS_INACTIVE = 2;

// User policy status constants
export const USER_POLICY_STATUS_ACTIVE = 1;
export const USER_POLICY_STATUS_EXPIRED = 2;
export const USER_POLICY_STATUS_CANCELLED = 3;

export interface BlockchainPolicy {
  id: string;
  title: string;
  description: string;
  policy_type: number;
  monthly_premium: string;
  yearly_premium: string;
  coverage_amount: string;
  min_age: string;
  max_age: string;
  duration_days: string;
  waiting_period_days: string;
  status: number;
  created_at: string;
  created_by: string;
}

export interface BlockchainUserPolicy {
  id: string;
  policy_id: string;
  user_address: string;
  purchase_date: string;
  expiry_date: string;
  premium_paid: string;
  status: number;
}

/**
 * Register a new user with a role (admin or user)
 */
export async function registerUser(
  role: number,
  signAndSubmitTransaction: any
) {
  try {
    const transaction = {
      data: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::register_user`,
        typeArguments: [],
        functionArguments: [role],
      },
    };

    const response = await signAndSubmitTransaction(transaction);
    await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    return {
      success: true,
      transactionHash: response.hash,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

/**
 * Register as admin
 */
export async function registerAsAdmin(signAndSubmitTransaction: any) {
  if (!signAndSubmitTransaction) {
    throw new Error("Wallet not connected or signAndSubmitTransaction not available");
  }
  return registerUser(ROLE_ADMIN, signAndSubmitTransaction);
}

/**
 * Register as policyholder
 */
export async function registerAsPolicyholder(signAndSubmitTransaction: any) {
  if (!signAndSubmitTransaction) {
    throw new Error("Wallet not connected or signAndSubmitTransaction not available");
  }
  return registerUser(ROLE_POLICYHOLDER, signAndSubmitTransaction);
}

/**
 * Get user role from blockchain (key function for auto-login like FarmAssure)
 */
export async function getUserRole(walletAddress: string): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::get_user_role`,
        typeArguments: [],
        functionArguments: [walletAddress],
      },
    });

    return result[0] as number;
  } catch (error) {
    console.error("Error getting user role:", error);
    return ROLE_UNREGISTERED; // Not registered
  }
}

/**
 * Create a new insurance policy (admin only - like FarmAssure addListing)
 */
export async function createPolicy(
  policyData: {
    title: string;
    description: string;
    policyType: number;
    monthlyPremium: number;
    yearlyPremium: number;
    coverageAmount: number;
    minAge: number;
    maxAge: number;
    durationDays: number;
    waitingPeriodDays: number;
  },
  signAndSubmitTransaction: any
) {
  try {
    const transaction = {
      data: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::create_policy`,
        typeArguments: [],
        functionArguments: [
          policyData.title,
          policyData.description,
          policyData.policyType,
          policyData.monthlyPremium.toString(),
          policyData.yearlyPremium.toString(),
          policyData.coverageAmount.toString(),
          policyData.minAge.toString(),
          policyData.maxAge.toString(),
          policyData.durationDays.toString(),
          policyData.waitingPeriodDays.toString(),
        ],
      },
    };

    const response = await signAndSubmitTransaction(transaction);
    await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    return {
      success: true,
      transactionHash: response.hash,
    };
  } catch (error) {
    console.error("Error creating policy:", error);
    throw error;
  }
}

/**
 * Purchase a policy (policyholder only - like FarmAssure completePurchase)
 */
export async function purchasePolicy(
  policyId: number,
  signAndSubmitTransaction: any
) {
  try {
    const transaction = {
      data: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::purchase_policy`,
        typeArguments: [],
        functionArguments: [policyId],
      },
    };

    const response = await signAndSubmitTransaction(transaction);
    await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    return {
      success: true,
      transactionHash: response.hash,
    };
  } catch (error) {
    console.error("Error purchasing policy:", error);
    throw error;
  }
}

/**
 * Get a specific policy by ID
 */
export async function getPolicy(policyId: string): Promise<BlockchainPolicy | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_platform::get_policy`,
        typeArguments: [],
        functionArguments: [policyId],
      },
    });

    if (result && result[0]) {
      return result[0] as BlockchainPolicy;
    }
    return null;
  } catch (error) {
    console.error("Error getting policy:", error);
    return null;
  }
}

/**
 * Get user's purchased policies (policyholder only - like FarmAssure getPendingDeliveries)
 */
export async function getUserPolicies(walletAddress: string): Promise<BlockchainUserPolicy[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::get_my_policies`,
        typeArguments: [],
        functionArguments: [walletAddress],
      },
    });

    return (result[0] as BlockchainUserPolicy[]) || [];
  } catch (error) {
    console.error("Error getting user policies:", error);
    return [];
  }
}

/**
 * Get all available policies (like FarmAssure getAllListings)
 */
export async function getAllPolicies(): Promise<BlockchainPolicy[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::get_all_policies`,
        typeArguments: [],
        functionArguments: [],
      },
    });

    return (result[0] as BlockchainPolicy[]) || [];
  } catch (error) {
    console.error("Error getting all policies:", error);
    return [];
  }
}

/**
 * Check if portal is initialized
 */
export async function isPortalInitialized(): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_portal::is_initialized`,
        typeArguments: [],
        functionArguments: [],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Error checking portal initialization:", error);
    return false;
  }
}

/**
 * Get the platform admin address
 */
export async function getPlatformAdmin(): Promise<string | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::insurance_platform::get_admin`,
        typeArguments: [],
        functionArguments: [],
      },
    });

    return result[0] as string;
  } catch (error) {
    console.error("Error getting platform admin:", error);
    return null;
  }
}

/**
 * Helper function to convert policy type number to string
 */
export function getPolicyTypeString(policyType: number): string {
  switch (policyType) {
    case POLICY_TYPE_HEALTH:
      return "Health";
    case POLICY_TYPE_LIFE:
      return "Life";
    case POLICY_TYPE_AUTO:
      return "Auto";
    case POLICY_TYPE_HOME:
      return "Home";
    case POLICY_TYPE_TRAVEL:
      return "Travel";
    default:
      return "Unknown";
  }
}

/**
 * Helper function to convert string policy type to number
 */
export function getPolicyTypeNumber(policyType: string): number {
  switch (policyType.toLowerCase()) {
    case "health":
      return POLICY_TYPE_HEALTH;
    case "life":
      return POLICY_TYPE_LIFE;
    case "auto":
      return POLICY_TYPE_AUTO;
    case "home":
      return POLICY_TYPE_HOME;
    case "travel":
      return POLICY_TYPE_TRAVEL;
    default:
      return POLICY_TYPE_HEALTH;
  }
}

/**
 * Helper function to format amounts (convert from string to number)
 */
export function formatAmount(amount: string): number {
  return parseInt(amount, 10);
}

/**
 * Helper function to format date (convert from timestamp to readable date)
 */
export function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return date.toLocaleDateString();
}
