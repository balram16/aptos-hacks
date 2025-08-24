# 🚀 Quick Start Guide

## 1. **Start Local Testnet** (Background):
```bash
cd contracts
aptos node run-local-testnet --with-faucet --force-restart
```

## 2. **Start Frontend**:
```bash
cd frontend  
npm run dev
```

## 3. **Open App**: `http://localhost:3000`

## 4. **Setup Admin** (First Time):
1. Connect Petra wallet (set to Local network)
2. Go to admin dashboard  
3. In browser console: 
```javascript
// Register as admin
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x29e93b3444df72f8da7c3303b27cf0ca099a5f219f5291d093701aff3633725c::simple_insurance::register_user",
    functionArguments: [2]
  }
})
```

## 5. **Setup User** (For Each User):
1. Connect different wallet
2. In browser console:
```javascript  
// Register as user
await window.aptos.signAndSubmitTransaction({
  data: {
    function: "0x29e93b3444df72f8da7c3303b27cf0ca099a5f219f5291d093701aff3633725c::simple_insurance::register_user", 
    functionArguments: [1]
  }
})
```

## 6. **Ready!** 
- Admin can create policies
- Users can purchase policies
- Everything works locally!

---

## 🎯 **Key Features:**
- ✅ No initialization required
- ✅ Direct role registration  
- ✅ Local blockchain
- ✅ Real Petra wallet integration
- ✅ Policy creation & purchasing
- ✅ ABHA consent simulation
- ✅ Transaction tracking

**बहुत Simple! Everything local pe chal raha है!** 🎉
