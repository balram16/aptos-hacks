# 🚀 **FarmAssure Style Insurance Portal - Ready!**

## ✅ **Status: DEPLOYED & READY**
- **Contract**: `0x7db1a4673c2c6a1c3031c16410ee916af2b3fcd809ba5b92ce920bcca202679f::insurance_portal`
- **Network**: Aptos Devnet
- **Style**: FarmAssure permanent wallet-role linking

## 🎯 **Key Features Implemented:**

### 1. **Permanent Wallet-Role Linking** (Like FarmAssure)
- Once wallet registers, role is **permanently stored**
- Refreshing page preserves authentication
- Auto-login based on wallet address

### 2. **Two User Types:**
- **Admin** (Role 2): Can create insurance policies
- **Policyholder** (Role 1): Can purchase insurance policies

### 3. **Core Functions:**
- `register_user(role)` - One-time registration
- `create_policy(...)` - Admin only
- `purchase_policy(policy_id)` - Policyholder only
- `get_user_role(address)` - Auto-login check
- `get_all_policies()` - Browse policies
- `get_my_policies(address)` - View purchased policies

## 🛠️ **How to Use:**

### **Redeploy Contract (Optional):**
If you want to deploy your own contract:

```bash
# Initialize Aptos CLI for devnet
aptos init --network devnet

# Deploy the contract  
cd contracts
./deploy.sh  # Linux/Mac
# or  
deploy.bat   # Windows

# Update CONTRACT_ADDRESS in frontend/lib/blockchain.ts
```

### **First Time Setup:**

**1. Admin Registration:**
```javascript
// In browser console
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x7db1a4673c2c6a1c3031c16410ee916af2b3fcd809ba5b92ce920bcca202679f::insurance_portal::register_user",
    functionArguments: [2] // Admin role
  }
})
```

**2. User Registration:**
```javascript
// In browser console  
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x7db1a4673c2c6a1c3031c16410ee916af2b3fcd809ba5b92ce920bcca202679f::insurance_portal::register_user",
    functionArguments: [1] // Policyholder role
  }
})
```

### **After Registration:**
1. **Connect Petra wallet** → Automatic role detection
2. **Admin** → Redirected to admin dashboard → Create policies
3. **Policyholder** → Redirected to user dashboard → Purchase policies

## 🎉 **Perfect FarmAssure Implementation:**
- ✅ Wallet-role permanent mapping
- ✅ Auto-login on page refresh  
- ✅ Role-based dashboard routing
- ✅ Direct blockchain interaction
- ✅ No complex initialization
- ✅ Production-ready on devnet

**Your insurance platform now works exactly like FarmAssure! 🌟**
