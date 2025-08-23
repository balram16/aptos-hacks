"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useWalletContext } from "@/context/wallet-context"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, userType, setUserType } = useWalletContext()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle wallet connection success
  useEffect(() => {
    if (isConnected && userType) {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setIsTransitioning(false)
        toast({
          title: "Wallet Connected",
          description: "Welcome to ChainSure!",
        })
        
        // Redirect based on user type
        if (userType === "user") {
          router.push("/dashboard/user")
        } else {
          router.push("/dashboard/provider")
        }
      }, 1500)
    }
  }, [isConnected, userType, router, toast])

  const handleUserTypeSelection = (type: "user" | "insurer") => {
    setUserType(type)
  }

  return (
    <>
      {isTransitioning && <Loader />}
      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {!userType ? (
              // User Type Selection Screen
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Image 
                    src="https://i.ibb.co/5Xn2hrY3/logo-white-bg.png"
                    alt="ChainSure Logo"
                    width={48}
                    height={48}
                    className="mx-auto rounded-xl mb-4"
                  />
                  <h1 className="text-2xl font-bold mb-2">Welcome to ChainSure</h1>
                  <p className="text-gray-600 dark:text-gray-400">Choose how you want to continue</p>
                </div>

                <div className="grid gap-4">
                  <Button
                    onClick={() => handleUserTypeSelection("user")}
                    className="h-auto p-4 bg-gradient-to-r from-[#fa6724] to-[#fa8124]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Image
                          src="https://i.ibb.co/DgLw71WX/claimsaathi-happy-tooexcited-smilingwithopenmouth.png"
                          alt="User"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">I'm a Policyholder</h3>
                        <p className="text-sm text-white/80">File and track insurance claims</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleUserTypeSelection("insurer")}
                    className="h-auto p-4 bg-gradient-to-r from-[#07a6ec] to-[#07c6ec]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Image
                          src="https://i.ibb.co/XZP3h1bN/claimsaathi-neutral-firm.png"
                          alt="Insurer"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">I'm an Insurance Provider</h3>
                        <p className="text-sm text-white/80">Manage and process claims</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              // Wallet Connection Interface
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setUserType(null)}
                  className="mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">
                    {userType === "user" ? "Policyholder Login" : "Insurance Provider Login"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {userType === "user" 
                      ? "Connect your Petra wallet to access your claims dashboard" 
                      : "Connect your Petra wallet to access your claims management system"}
                  </p>
                </div>

                <div className="space-y-6 text-center">
                  <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-[#fa6724] to-[#07a6ec] p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <Image
                        src="https://i.ibb.co/8nHxb4zN/claimsaathi-snapping-winking.png"
                        alt="Claim Saathi"
                        width={120}
                        height={120}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Connect Your Petra Wallet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
                      Secure, decentralized authentication powered by Aptos blockchain. 
                      Your wallet is your identity on ChainSure.
                    </p>
                    
                    <div className="pt-4">
                      <WalletButton 
                        className="w-full h-12 text-base bg-[#fa6724] hover:bg-[#e55613]"
                        size="lg"
                      />
                    </div>
                    
                    {!isConnected && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        <p>Don't have Petra wallet? 
                          <a 
                            href="https://petra.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#07a6ec] hover:underline ml-1"
                          >
                            Download here
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">🔐 Powered by Aptos blockchain</p>
                    <p>✅ No passwords • ✅ Secure • ✅ Decentralized</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#fa6724] to-[#07a6ec] relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-md text-white">
              <h2 className="text-3xl font-bold mb-4">Revolutionizing Insurance Claims</h2>
              <p className="text-lg mb-6">
                ChainSure reduces claim settlement time from 90 days to under 3 minutes with AI & blockchain
                technology.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Image
                      src="https://i.ibb.co/JFW8D5KV/claimsaathi-goodmood-happy.png"
                      alt="Claim Saathi"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm">
                      "ChainSure processed my health insurance claim in just 2 hours! The blockchain verification gave
                      me confidence that everything was secure."
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium">Priya Sharma, Health Insurance Policyholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
