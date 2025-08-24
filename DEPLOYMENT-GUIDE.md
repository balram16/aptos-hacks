# 🚀 **Contract Deployment Guide**

## ✅ **Recommended Commands**

### **Initialize Aptos CLI**
```bash
# Use this command instead of just 'aptos init'
aptos init --network devnet
```

### **Full Deployment Process**

**1. Initialize Aptos CLI for Devnet:**
```bash
aptos init --network devnet
```

**2. Navigate to Contract Directory:**
```bash
cd contracts
```

**3. Deploy Using Scripts (Recommended):**

**Linux/Mac:**
```bash
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

**4. Manual Deployment (Alternative):**
```bash
# Compile
aptos move compile --profile devnet

# Deploy
aptos move publish --profile devnet --assume-yes
```

**5. Get Your Contract Address:**
```bash
aptos account lookup-address --profile devnet
```

**6. Update Frontend:**
```bash
# Update CONTRACT_ADDRESS in frontend/lib/blockchain.ts
# with your new contract address
```

---

## 🔧 **Deploy Script Details**

The automated deploy scripts (`deploy.sh` / `deploy.bat`) use:
```bash
aptos init --profile devnet --network devnet
```

This creates a named profile "devnet" specifically for devnet deployment.

---

## ⚡ **Quick Commands Summary**

```bash
# Initialize (use this format)
aptos init --network devnet

# Deploy contract
cd contracts && ./deploy.sh

# Start frontend
cd frontend && npm run dev
```

---

## ✅ **Why Use --network devnet**

- **Explicit**: Clearly specifies the target network
- **Safe**: Prevents accidental mainnet deployments
- **Clear**: No ambiguity about which network you're using
- **Recommended**: Best practice for Aptos development

**अब deployment बिल्कुल clear है! 🎯**
