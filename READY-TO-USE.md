# 🎉 **INSURANCE PORTAL - READY TO USE!**

## ✅ **DEPLOYMENT STATUS: LIVE ON DEVNET**

**Contract Address**: `0x4f21240e952ab01526602429046f4166c2bac8cf90510a6f6ef72e3fec52a714`
**Network**: Aptos Devnet  
**Style**: FarmAssure permanent wallet-role linking

---

## 🚀 **EXACTLY LIKE YOUR FARMASSURE PROJECT**

### ✅ **Key Features Implemented:**

1. **Permanent Wallet Registration** ✅
   - Register once, stay logged in forever
   - Role stored on blockchain permanently
   - Auto-login on page refresh

2. **Two User Types** ✅  
   - **Admin** (Role 2) → Create policies
   - **Policyholder** (Role 1) → Purchase policies

3. **Auto-Login System** ✅
   - Connect wallet → Check role on blockchain → Auto-route to dashboard
   - No manual login needed after registration

---

## 🛠️ **QUICK START (5 MINUTES)**

### **Step 1: Start Frontend**
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### **Step 0: Redeploy Contract (Optional)**
If you want to deploy your own contract instead of using the existing one:

```bash
# Initialize Aptos CLI for devnet
aptos init --network devnet

# Deploy the contract
cd contracts
./deploy.sh  # Linux/Mac
# or
deploy.bat   # Windows

# Update CONTRACT_ADDRESS in frontend/lib/blockchain.ts with your new address
```

### **Step 2: Register Users (One-time)**

**Admin Registration:**
```javascript
// In browser console after connecting Petra wallet
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x4f21240e952ab01526602429046f4166c2bac8cf90510a6f6ef72e3fec52a714::insurance_portal::register_user",
    functionArguments: [2] // Admin role
  }
})
```

**Policyholder Registration:**
```javascript
// Different wallet, browser console
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x4f21240e952ab01526602429046f4166c2bac8cf90510a6f6ef72e3fec52a714::insurance_portal::register_user", 
    functionArguments: [1] // Policyholder role
  }
})
```

### **Step 3: Use the App**
1. **Connect Petra Wallet** → **Automatic login based on blockchain role**
2. **Admin** → Create insurance policies
3. **Policyholder** → Browse & purchase policies

---

## 🎯 **WORKFLOW (Just Like FarmAssure)**

```
Connect Wallet → Check Blockchain Role → Auto-Route to Dashboard
     ↓
┌─ Admin? → Admin Dashboard → Create Policies
│
└─ Policyholder? → User Dashboard → Purchase Policies
```

---

## 📋 **CONTRACT FUNCTIONS**

```move
// Registration (one-time)
register_user(role: 1 or 2)

// Admin functions
create_policy(title, description, type, premium, coverage, ...)

// Policyholder functions  
purchase_policy(policy_id)

// View functions
get_user_role(address) → role number
get_all_policies() → all available policies
get_my_policies(address) → user's purchased policies
```

---

## 🎉 **SUCCESS METRICS**

✅ **Deployed**: Contract live on devnet  
✅ **Tested**: Registration & role-checking working  
✅ **Auto-Login**: Permanent wallet-role mapping  
✅ **Role-Based**: Admin vs Policyholder separation  
✅ **Production Ready**: No initialization needed  

**आपका FarmAssure-style insurance platform तैयार है! 🚀**

**Test करके देखें - बिल्कुल FarmAssure की तरह काम करेगा! 🎯**
