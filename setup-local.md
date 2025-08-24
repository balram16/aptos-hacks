# 🏠 Local Development Setup

## ✅ सब कुछ Local पर Setup हो गया है!

### 🚀 **Current Status:**
- ✅ Local Aptos testnet running
- ✅ Smart contract deployed at: `0x29e93b3444df72f8da7c3303b27cf0ca099a5f219f5291d093701aff3633725c`
- ✅ No initialization required
- ✅ Direct admin/user registration
- ✅ Frontend configured for local network

### 📋 **How to Run:**

1. **Start Local Testnet** (if not running):
```bash
aptos node run-local-testnet --with-faucet --force-restart
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Open** `http://localhost:3000`

### 🎯 **Usage Flow:**

**Admin:**
1. Connect Petra wallet to local network
2. Register as admin: Call `register_user(2)` 
3. Create policies directly
4. No initialization needed!

**User:**
1. Connect Petra wallet to local network  
2. Register as user: Call `register_user(1)`
3. Authorize ABHA (dummy flow)
4. Purchase policies directly

### 🔧 **Key Changes Made:**
- ❌ Removed initialization complexity
- ❌ Removed platform status checks
- ❌ Removed initialization guard
- ✅ Direct role registration
- ✅ Simplified contract structure
- ✅ Local testnet deployment
- ✅ Clean admin/user workflow

### 📊 **Contract Functions:**
- `register_user(role)` - Register as admin (2) or user (1)
- `create_policy(...)` - Admin creates policies
- `purchase_policy(policy_id, admin_address)` - User buys policy
- `get_user_role(address)` - Check role
- `get_user_policies(address)` - Get purchased policies

सब कुछ अब बहुत simple है! 🎉
