"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Heart, 
  Car, 
  Home, 
  Plane, 
  ShoppingCart, 
  CheckCircle, 
  Clock,
  CreditCard,
  FileText,
  TrendingUp,
  User,
  Loader2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWalletContext } from "@/context/wallet-context"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { StateRestorationNotice } from "@/components/ui/state-restoration-notice"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { 
  purchasePolicy, 
  getUserPolicies as getBlockchainUserPolicies, 
  getUserRole, 
  getAllPolicies, // <-- add this import
  getPolicyTypeString, // <-- add this import
  ROLE_USER 
} from "@/lib/blockchain"

interface Policy {
  id: string
  title: string
  description: string
  provider: string
  type: "Health" | "Life" | "Auto" | "Home" | "Travel"
  premium: {
    monthly: number
    yearly: number
  }
  coverage: {
    amount: number
    currency: string
  }
  features: string[]
  benefits: string[]
}

interface UserPolicy {
  id: string
  policyId: string
  userWallet: string
  purchaseDate: string
  status: "Active" | "Expired" | "Claimed" | "Cancelled"
  premiumPaid: number
  nextPremiumDue?: string
  policy: Policy
}

export default function UserDashboard() {
  const [availablePolicies, setAvailablePolicies] = useState<Policy[]>([])
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  
  const { 
    address, 
    isPolicyholder, 
    isRegistered, 
    hasAbhaConsent, 
    blockchainLoading, 
    refreshBlockchainState 
  } = useWalletContext()
  const { signAndSubmitTransaction } = useWallet()
  const { toast } = useToast()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Health": return <Heart className="h-5 w-5" />
      case "Life": return <User className="h-5 w-5" />
      case "Auto": return <Car className="h-5 w-5" />
      case "Home": return <Home className="h-5 w-5" />
      case "Travel": return <Plane className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Health": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "Life": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "Auto": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "Home": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "Travel": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const fetchPolicies = async () => {
    try {
      const blockchainPolicies = await getAllPolicies();
      const mappedPolicies = blockchainPolicies.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        provider: "ChainSure",
        type: getPolicyTypeString(Number(p.policy_type)) as "Health" | "Life" | "Auto" | "Home" | "Travel",
        premium: {
          monthly: parseInt(p.monthly_premium),
          yearly: parseInt(p.yearly_premium),
        },
        coverage: {
          amount: parseInt(p.coverage_amount),
          currency: "₹",
        },
        features: [], // Add if available in contract
        benefits: [], // Add if available in contract
      }));
      setAvailablePolicies(mappedPolicies);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available policies from blockchain",
        variant: "destructive"
      });
    }
  }

  // User status is now managed by wallet context

  const handleRegisterUser = async () => {
    if (!signAndSubmitTransaction) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    setRegistering(true)
    try {
      await registerUser(address!, ROLE_USER, signAndSubmitTransaction)
      toast({
        title: "Registration Successful",
        description: "You have been registered as a user and can now purchase policies",
      })
      await refreshBlockchainState()
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as user",
        variant: "destructive"
      })
    } finally {
      setRegistering(false)
    }
  }

  const fetchUserPolicies = async () => {
    if (!address) return;
    try {
      const blockchainUserPolicies = await getBlockchainUserPolicies(address);
      const allPolicies = await getAllPolicies();
      const formattedPolicies = blockchainUserPolicies.map((bp) => {
        const policy = allPolicies.find((p) => p.id === bp.policy_id);
        return {
          id: bp.id,
          policyId: bp.policy_id,
          userWallet: bp.user_address,
          purchaseDate: new Date(parseInt(bp.purchase_date) * 1000).toISOString(),
          status: bp.status === 1 ? "Active" : "Expired",
          premiumPaid: parseInt(bp.premium_paid),
          policy: policy
            ? {
                id: policy.id,
                title: policy.title,
                description: policy.description,
                provider: "ChainSure",
                type: getPolicyTypeString(Number(policy.policy_type)) as "Health" | "Life" | "Auto" | "Home" | "Travel",
                premium: {
                  monthly: parseInt(policy.monthly_premium),
                  yearly: parseInt(policy.yearly_premium),
                },
                coverage: {
                  amount: parseInt(policy.coverage_amount),
                  currency: "₹",
                },
                features: [],
                benefits: [],
              }
            : undefined,
        };
      });
      setUserPolicies(formattedPolicies);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your policies from blockchain",
        variant: "destructive"
      });
    }
  }

  const handlePurchasePolicy = async (policyId: string) => {
    if (!hasAbhaConsent) {
      toast({
        title: "ABHA Consent Required",
        description: "Please authorize your ABHA data access before purchasing policies",
        variant: "destructive"
      })
      return
    }

    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase policies",
        variant: "destructive"
      })
      return
    }

    // Removed user registration check - simplified flow

    if (!signAndSubmitTransaction) {
      toast({
        title: "Error",
        description: "Please ensure your wallet is properly connected",
        variant: "destructive"
      })
      return
    }

    setPurchasing(policyId)

    try {
      // Convert policy ID to number for new contract
      const policyIdNumber = parseInt(policyId)
      const result = await purchasePolicy(policyIdNumber, signAndSubmitTransaction)
      
      if (result.success) {
        toast({
          title: "Policy Purchased Successfully!",
          description: `Transaction Hash: ${result.transactionHash}`,
        })
        
        // Refresh user policies
        await fetchUserPolicies()
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to purchase policy",
        variant: "destructive"
      })
    } finally {
      setPurchasing(null)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPolicies(), fetchUserPolicies()])
      setLoading(false)
    }
    
    if (address && !blockchainLoading) {
      loadData()
    }
  }, [address, blockchainLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="container mx-auto p-6">
        <StateRestorationNotice />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Policy Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your insurance policies and explore new coverage options
          </p>
          
          {/* User Status */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Badge variant={isPolicyholder ? "default" : "destructive"}>
              {isPolicyholder ? "Policyholder Registered" : "Not Registered"}
            </Badge>
            <Badge variant={hasAbhaConsent ? "default" : "secondary"}>
              {hasAbhaConsent ? "ABHA Authorized" : "ABHA Not Authorized"}
            </Badge>
            {blockchainLoading && (
              <Badge variant="outline" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </Badge>
            )}
            <Button
              onClick={refreshBlockchainState}
              disabled={blockchainLoading}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              🔄 Refresh
            </Button>
          </div>

          {/* Registration status - FarmAssure style */}
          {!isRegistered && (
            <Card className="mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                      Registration Required
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Please register as a policyholder to purchase insurance policies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isPolicyholder && (
            <Card className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Ready to Purchase Policies
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You're registered as a policyholder. Browse and purchase insurance policies!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Policies</p>
                  <p className="text-2xl font-bold">{userPolicies.filter(p => p.status === "Active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Coverage</p>
                  <p className="text-2xl font-bold">
                    ₹{userPolicies.reduce((sum, p) => sum + (p.policy?.coverage?.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Paid</p>
                  <p className="text-2xl font-bold">
                    ₹{userPolicies.reduce((sum, p) => sum + p.premiumPaid, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Claims Made</p>
                  <p className="text-2xl font-bold">
                    {userPolicies.reduce((sum, p) => sum + (p.claimsHistory?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Policies</TabsTrigger>
            <TabsTrigger value="my-policies">My Policies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePolicies.map((policy) => (
                <Card key={policy.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(policy.type)}
                        <Badge className={getTypeColor(policy.type)}>
                          {policy.type}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Coverage</p>
                        <p className="text-xl font-bold text-green-600">
                          {policy.coverage.currency}{policy.coverage.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
                        <p className="text-lg font-semibold">
                          ₹{policy.premium.yearly.toLocaleString()}/year
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Key Features:</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {policy.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={() => handlePurchasePolicy(policy.id)}
                      disabled={purchasing === policy.id || !hasAbhaConsent}
                      className="w-full"
                    >
                      {purchasing === policy.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase Policy
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-policies" className="space-y-6">
            {userPolicies.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Policies Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't purchased any policies yet. Explore our available policies to get started.
                  </p>
                  <Button onClick={() => {
                    const tabsTrigger = document.querySelector('[value="available"]') as HTMLElement
                    tabsTrigger?.click()
                  }}>
                    Browse Policies
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userPolicies.map((userPolicy) => (
                  <Card key={userPolicy.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(userPolicy.policy?.type || "Health")}
                          <Badge className={getTypeColor(userPolicy.policy?.type || "Health")}>
                            {userPolicy.policy?.type}
                          </Badge>
                        </div>
                        <Badge variant={userPolicy.status === "Active" ? "default" : "secondary"}>
                          {userPolicy.status}
                        </Badge>
                      </div>
                      <CardTitle>{userPolicy.policy?.title}</CardTitle>
                      <CardDescription>
                        Purchased on {new Date(userPolicy.purchaseDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Coverage</p>
                          <p className="font-semibold">
                            {userPolicy.policy?.coverage?.currency}{userPolicy.policy?.coverage?.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Premium Paid</p>
                          <p className="font-semibold">₹{userPolicy.premiumPaid.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {userPolicy.nextPremiumDue && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">
                            Next premium due: {new Date(userPolicy.nextPremiumDue).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Make Claim
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}