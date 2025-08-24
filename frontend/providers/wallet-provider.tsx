"use client"

import React from "react"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { Network } from "@aptos-labs/ts-sdk"

const wallets = [new PetraWallet()]

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <AptosWalletAdapterProvider 
      plugins={wallets} 
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{
        network: Network.DEVNET, // Back to devnet for production
        mizuwallet: {
          manifestURL: "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json"
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
