"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { getUserRole, ROLE_ADMIN, ROLE_POLICYHOLDER, ROLE_UNREGISTERED } from "@/lib/blockchain"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  userType: "user" | "admin" | null
  setUserType: (type: "user" | "admin" | null) => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isLoading: boolean
  hasAbhaConsent: boolean
  setHasAbhaConsent: (consent: boolean) => void
  // Blockchain state
  isAdmin: boolean
  isPolicyholder: boolean
  isRegistered: boolean
  blockchainLoading: boolean
  refreshBlockchainState: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { connect, disconnect, account, connected, wallet } = useWallet()
  const [userType, setUserType] = useState<"user" | "admin" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAbhaConsent, setHasAbhaConsent] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPolicyholder, setIsPolicyholder] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [blockchainLoading, setBlockchainLoading] = useState(false)
  const router = useRouter()

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      await connect("Petra" as any)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      setIsLoading(true)
      await disconnect()
      setUserType(null)
      setIsAdmin(false)
      setIsPolicyholder(false)
      setIsRegistered(false)
      router.push("/auth/login")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert account address to string
  const getAddressString = (address: any): string | null => {
    if (!address) return null
    
    // Handle different address formats
    if (typeof address === 'string') {
      return address
    }
    
    // Handle AccountAddress object with toString method
    if (address.toString && typeof address.toString === 'function') {
      return address.toString()
    }
    
    // Handle AccountAddress object with data property (Uint8Array)
    if (address.data && address.data instanceof Uint8Array) {
      // Convert Uint8Array to hex string
      const uint8Array = address.data as Uint8Array
      const hexString = Array.prototype.map.call(uint8Array, (b: number) => 
        b.toString(16).padStart(2, '0')
      ).join('')
      return `0x${hexString}`
    }
    
    return null
  }

  // Check blockchain state for connected wallet
  const refreshBlockchainState = async () => {
    if (!account?.address) {
      setIsAdmin(false)
      setIsPolicyholder(false)
      setIsRegistered(false)
      return
    }

    const addressString = getAddressString(account.address)
    if (!addressString) {
      console.error("Could not convert address to string:", account.address)
      setIsAdmin(false)
      setIsPolicyholder(false)
      setIsRegistered(false)
      return
    }

    setBlockchainLoading(true)
    try {
      console.log("Checking blockchain state for address:", addressString)
      
      // Check user role directly (like FarmAssure)
      const role = await getUserRole(addressString)
      const adminStatus = role === ROLE_ADMIN
      const policyholderStatus = role === ROLE_POLICYHOLDER
      const registeredStatus = role !== ROLE_UNREGISTERED
      
      setIsAdmin(adminStatus)
      setIsPolicyholder(policyholderStatus)
      setIsRegistered(registeredStatus)
      
      // Auto-update userType based on blockchain role (FarmAssure style)
      if (adminStatus) {
        setUserType("admin")
      } else if (policyholderStatus) {
        setUserType("user")
      } else {
        setUserType(null)
      }

      console.log("Blockchain state refreshed:", {
        address: addressString,
        role,
        isAdmin: adminStatus,
        isPolicyholder: policyholderStatus,
        isRegistered: registeredStatus
      })
    } catch (error) {
      console.error("Error checking blockchain state:", error)
      // On error, reset to safe defaults
      setIsAdmin(false)
      setIsPolicyholder(false)
      setIsRegistered(false)
    } finally {
      setBlockchainLoading(false)
    }
  }

  // Store user type in localStorage
  useEffect(() => {
    if (userType) {
      localStorage.setItem("chainsure-user-type", userType)
    } else {
      localStorage.removeItem("chainsure-user-type")
    }
  }, [userType])

  // Restore user type and ABHA consent from localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("chainsure-user-type")
    const storedAbhaConsent = localStorage.getItem("chainsure-abha-consent")
    
    if (storedUserType && (storedUserType === "user" || storedUserType === "admin")) {
      setUserType(storedUserType)
    }
    
    if (storedAbhaConsent === "true") {
      setHasAbhaConsent(true)
    }
  }, [])

  // Store ABHA consent in localStorage
  useEffect(() => {
    if (hasAbhaConsent) {
      localStorage.setItem("chainsure-abha-consent", "true")
    } else {
      localStorage.removeItem("chainsure-abha-consent")
    }
  }, [hasAbhaConsent])

  // Refresh blockchain state when wallet connects/reconnects
  useEffect(() => {
    if (connected && account?.address) {
      // Small delay to ensure wallet is fully connected
      setTimeout(() => {
        refreshBlockchainState()
      }, 1000)
    } else {
      // Reset blockchain state when disconnected
      setIsAdmin(false)
      setIsPolicyholder(false)
      setIsRegistered(false)
    }
  }, [connected, account?.address])

  const value: WalletContextType = {
    isConnected: connected,
    address: getAddressString(account?.address),
    userType,
    setUserType,
    connectWallet,
    disconnectWallet,
    isLoading,
    hasAbhaConsent,
    setHasAbhaConsent,
    // Blockchain state
    isAdmin,
    isPolicyholder,
    isRegistered,
    blockchainLoading,
    refreshBlockchainState,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletContextProvider")
  }
  return context
}
