"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useRouter } from "next/navigation"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  userType: "user" | "insurer" | null
  setUserType: (type: "user" | "insurer" | null) => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { connect, disconnect, account, connected, wallet } = useWallet()
  const [userType, setUserType] = useState<"user" | "insurer" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      await connect("Petra" as any) // Type assertion for Petra wallet
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
      router.push("/auth/login")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    } finally {
      setIsLoading(false)
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

  // Restore user type from localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("chainsure-user-type")
    if (storedUserType && (storedUserType === "user" || storedUserType === "insurer")) {
      setUserType(storedUserType)
    }
  }, [])

  const value: WalletContextType = {
    isConnected: connected,
    address: account?.address || null,
    userType,
    setUserType,
    connectWallet,
    disconnectWallet,
    isLoading,
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
