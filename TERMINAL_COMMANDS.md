# Terminal Commands - Copy & Paste Guide

This document contains all the commands you need to copy and paste into your terminal.

---

## Initial Setup (Run Once)

### 1. Clone and Enter Repository

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git
cd latam-coin-hub
```

### 2. Install Dependencies

```bash
npm install
cd contracts
npm install
cd ..
```

### 3. Setup Environment File

```bash
cp .env.example .env
```

Now edit `.env` and add your private key:

```bash
# For Mac/Linux:
nano .env

# For Windows (use any text editor):
notepad .env
```

Find this line:
```
PRIVATE_KEY=
```

Change it to:
```
PRIVATE_KEY=0xYourActualPrivateKeyHere
```

Save and exit (Ctrl+X, then Y, then Enter if using nano).

### 4. Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia
```

**Copy the contract addresses from the output!**

### 5. Update .env with Contract Addresses

Option A - Manual (recommended):
```bash
cd ..
nano .env
```

Add these lines (replace with your actual addresses):
```
VITE_MOCK_USDC_ADDRESS=0xYourMockUSDCAddress
VITE_MOCK_USDT_ADDRESS=0xYourMockUSDTAddress
VITE_EST_TOKEN_ADDRESS=0xYourEstTokenAddress
VITE_YIELD_VAULT_ADDRESS=0xYourYieldVaultAddress
VITE_EST_STAKE_ADDRESS=0xYourEstStakeAddress
```

Option B - Automatic (Mac/Linux only):
```bash
cd ..
./quick-setup.sh
# Select option 3
```

### 6. Start Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:5173/beta**

---

## Quick Start (After Initial Setup)

If you've already done the setup, just run:

```bash
cd latam-coin-hub
npm run dev
```

Then open: **http://localhost:5173/beta**

---

## Using the Quick Setup Script

### Make Script Executable (Mac/Linux only)

```bash
chmod +x quick-setup.sh
```

### Run the Script

```bash
./quick-setup.sh
```

Then select from the menu:
- Option 1: Install dependencies
- Option 2: Deploy contracts
- Option 3: Update .env with contract addresses
- Option 4: Start dev server
- Option 5: Run all steps automatically

---

## Troubleshooting Commands

### Check Node.js Version

```bash
node --version
```

Should show v18 or higher.

### Check if .env File Exists

```bash
cat .env
```

Should show your environment variables.

### Check if Contracts are Deployed

```bash
cat contracts/deployments.json
```

Should show contract addresses.

### Check Contract Addresses in .env

```bash
cat .env | grep VITE_MOCK
```

Should show the contract addresses.

### Verify a Contract on BaseScan

```bash
cd contracts
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

Replace `YOUR_CONTRACT_ADDRESS` with actual address.

### Clean and Reinstall

If something goes wrong:

```bash
rm -rf node_modules package-lock.json
rm -rf contracts/node_modules contracts/package-lock.json
npm install
cd contracts
npm install
cd ..
```

### Kill Processes on Port 5173

If you get "port already in use":

```bash
# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or just:
pkill -f vite
```

---

## Deployment Commands

### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### Run Tests

```bash
cd contracts
npx hardhat test
```

### Deploy to Base Sepolia

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Deploy to Local Hardhat Network

```bash
cd contracts
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Git Commands (For Later)

### Check Status

```bash
git status
```

### Pull Latest Changes

```bash
git pull origin main
```

### Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Changes

```bash
git add .
git commit -m "Your commit message"
git push origin your-branch-name
```

---

## Wallet Setup

### Get Base Sepolia ETH

Visit one of these faucets:
- https://www.base.org/faucets (recommended)
- https://sepoliafaucet.com/ (then bridge to Base)

### Add Base Sepolia to MetaMask

Network Details:
- **Network Name:** Base Sepolia
- **RPC URL:** https://sepolia.base.org
- **Chain ID:** 84532
- **Currency Symbol:** ETH
- **Block Explorer:** https://sepolia.basescan.org

---

## Quick Reference

### Check if Everything is Set Up

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check .env exists
ls -la .env

# Check private key is set
grep "PRIVATE_KEY=0x" .env

# Check contract addresses are set
grep "VITE_MOCK_USDC_ADDRESS=0x" .env

# Check contracts deployed
ls contracts/deployments.json
```

If all commands succeed, you're good to go!

### Start the App

```bash
cd latam-coin-hub
npm run dev
```

### Open Beta Page

```
http://localhost:5173/beta
```

---

## One-Line Full Setup (Mac/Linux)

For a completely fresh start:

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git && cd latam-coin-hub && npm install && cd contracts && npm install && cd .. && cp .env.example .env && echo "✅ Setup complete! Now edit .env and add your PRIVATE_KEY, then run: ./quick-setup.sh"
```

Then:
1. Edit `.env` to add your `PRIVATE_KEY`
2. Run `./quick-setup.sh` and select option 5

---

## Environment Variables Quick Reference

Your `.env` file should have these variables set:

```bash
# Database (Already configured)
VITE_SUPABASE_URL=https://qqnppagxxdzrrpbvqpgn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Network (Already configured)
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Your Private Key (YOU MUST ADD THIS)
PRIVATE_KEY=0xYourPrivateKeyHere

# Contract Addresses (Filled after deployment)
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_EST_TOKEN_ADDRESS=0x...
VITE_YIELD_VAULT_ADDRESS=0x...
VITE_EST_STAKE_ADDRESS=0x...
```

---

## Next Steps After Setup

1. Open http://localhost:5173/beta
2. Connect your wallet (MetaMask)
3. Make sure you're on Base Sepolia network
4. Test the gas faucet
5. Test the token faucet
6. Try staking/vaults features

---

## Getting Help

If you're stuck, check:
1. All prerequisites are installed (Node.js v18+)
2. `.env` file exists and has all variables
3. Contracts are deployed (check `contracts/deployments.json`)
4. You have Base Sepolia ETH in your wallet
5. MetaMask is connected to Base Sepolia network

Still stuck? Check the full guide: `SETUP_GUIDE.md`
