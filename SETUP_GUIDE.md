# Complete Setup Guide for LATAM Coin Hub Beta

This guide will walk you through everything from cloning the repository to accessing the beta test page.

## Prerequisites

Before starting, make sure you have:

1. **Node.js v18 or higher** - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **A Web3 wallet** (MetaMask or Rabby) - [Install MetaMask](https://metamask.io/)
4. **Base Sepolia testnet ETH** (we'll get this in Step 3)

---

## Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git
cd latam-coin-hub
```

---

## Step 2: Install Dependencies

Install the main project dependencies:

```bash
npm install
```

Install contract dependencies:

```bash
cd contracts
npm install
cd ..
```

---

## Step 3: Get Base Sepolia Test ETH

You need Base Sepolia ETH to deploy contracts. Here's how to get it:

### Option A: Base Sepolia Faucet (Recommended)
1. Visit https://www.base.org/faucets
2. Connect your wallet
3. Request Base Sepolia ETH

### Option B: Bridge from Ethereum Sepolia
1. Get Ethereum Sepolia ETH from https://sepoliafaucet.com/
2. Bridge to Base Sepolia at https://bridge.base.org/

**Check your balance:**
- Open MetaMask
- Switch to "Base Sepolia" network
- Your balance should show > 0.01 ETH

---

## Step 4: Export Your Private Key

⚠️ **WARNING: NEVER share your private key or use a wallet with real funds for testing!**

Create a NEW wallet just for testing:

### In MetaMask:
1. Click the three dots next to your account
2. Select "Account Details"
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key (starts with 0x)

---

## Step 5: Configure Environment Variables

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` in a text editor and add your private key:

```bash
# Find this line:
PRIVATE_KEY=

# Replace it with your private key:
PRIVATE_KEY=0xYourPrivateKeyHere
```

The `.env` file should look like this:

```env
VITE_SUPABASE_URL=https://qqnppagxxdzrrpbvqpgn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbnBwYWd4eGR6cnJwYnZxcGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzExMTMsImV4cCI6MjA3NTg0NzExM30.hXN8HHErfV6xNBFbMhL8sbOUv6QDJQUnzc6UqWmg3SM

VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Your private key here:
PRIVATE_KEY=0xYourActualPrivateKeyHere

# These will be filled automatically after deployment:
VITE_MOCK_USDC_ADDRESS=
VITE_MOCK_USDT_ADDRESS=
VITE_EST_TOKEN_ADDRESS=
VITE_YIELD_VAULT_ADDRESS=
VITE_EST_STAKE_ADDRESS=
```

---

## Step 6: Deploy Smart Contracts

Now let's deploy the contracts to Base Sepolia:

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia
```

You should see output like:

```
╔═══════════════════════════════════════════════════════════╗
║   Estable Beta Contracts Deployment - Base Sepolia       ║
╚═══════════════════════════════════════════════════════════╝

📋 Deployment Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deployer Address:  0x...
Network:           base-sepolia
Chain ID:          84532
Deployer Balance:  0.05 ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Deploying MockUSDC...
✅ MockUSDC deployed to: 0x...

2️⃣  Deploying MockUSDT...
✅ MockUSDT deployed to: 0x...

3️⃣  Deploying EstToken...
✅ EstToken deployed to: 0x...

4️⃣  Deploying YieldVault...
✅ YieldVault deployed to: 0x...

5️⃣  Deploying EstStake...
✅ EstStake deployed to: 0x...

╔═══════════════════════════════════════════════════════════╗
║              DEPLOYMENT SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝

Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MockUSDC:     0x...
MockUSDT:     0x...
EstToken:     0x...
YieldVault:   0x...
EstStake:     0x...
```

**Copy all these addresses!** You'll need them in the next step.

---

## Step 7: Update .env with Contract Addresses

The deployment script saves addresses to `contracts/deployments.json`.

You can either:

### Option A: Manually copy from terminal output
Edit the root `.env` file and paste the addresses:

```env
VITE_MOCK_USDC_ADDRESS=0xYourMockUSDCAddress
VITE_MOCK_USDT_ADDRESS=0xYourMockUSDTAddress
VITE_EST_TOKEN_ADDRESS=0xYourEstTokenAddress
VITE_YIELD_VAULT_ADDRESS=0xYourYieldVaultAddress
VITE_EST_STAKE_ADDRESS=0xYourEstStakeAddress
```

### Option B: Use this helper command
```bash
cd ..
node -e "const d=require('./contracts/deployments.json');console.log(\`VITE_MOCK_USDC_ADDRESS=\${d.mockUSDC}\nVITE_MOCK_USDT_ADDRESS=\${d.mockUSDT}\nVITE_EST_TOKEN_ADDRESS=\${d.estToken}\nVITE_YIELD_VAULT_ADDRESS=\${d.yieldVault}\nVITE_EST_STAKE_ADDRESS=\${d.estStake}\`)" >> .env
```

---

## Step 8: Start the Development Server

From the root directory:

```bash
npm run dev
```

You should see:

```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 9: Access the Beta Page

Open your browser and go to:

**http://localhost:5173/beta**

---

## Step 10: Connect Your Wallet

1. On the beta page, click "Connect Wallet"
2. Select MetaMask (or your wallet)
3. Make sure you're on **Base Sepolia** network
4. Approve the connection

---

## Step 11: Use the Faucet

Now you can test the faucet:

### Get Gas (ETH)
1. Click "Get Gas Tokens"
2. Enter 0.01 (or any amount up to 0.1)
3. Click "Request Gas"
4. Approve the transaction in MetaMask

### Get Test Tokens
1. Select a token (mUSDC, mUSDT, or EST)
2. Enter an amount (e.g., 100)
3. Click "Request Tokens"
4. Approve the transaction

---

## Troubleshooting

### "Insufficient funds" error
- You need Base Sepolia ETH in your wallet
- Get more from the faucet in Step 3

### "Cannot read properties of undefined"
- Check that all contract addresses are in `.env`
- Make sure `.env` is in the root directory, not in `/contracts`

### Wallet doesn't connect
- Make sure MetaMask is installed
- Switch to Base Sepolia network in MetaMask
- Refresh the page

### Contracts fail to deploy
- Check your private key is correct in `.env`
- Make sure you have enough Base Sepolia ETH (at least 0.01 ETH)
- Try again: `cd contracts && npx hardhat run scripts/deploy.ts --network baseSepolia`

### Port 5173 already in use
- Stop other Vite servers: `pkill -f vite`
- Or change the port in `vite.config.ts`

---

## Verify Your Setup

Check everything is working:

```bash
# Check contract addresses are set
cat .env | grep VITE_MOCK

# Check Node.js version
node --version  # Should be v18+

# Check if contracts are deployed
cd contracts
npx hardhat console --network baseSepolia
# In console: await ethers.provider.getCode("YOUR_EST_TOKEN_ADDRESS")
# Should return bytecode (long string starting with 0x)
```

---

## Next Steps

Once everything is running:

1. **Test the faucet** - Request tokens and check your balances
2. **Try staking** - Stake EST tokens in the staking contract
3. **Test vaults** - Deposit mUSDC or mUSDT into the yield vault
4. **Report bugs** - Submit feedback through the beta interface

---

## Important Security Notes

⚠️ **TESTNET ONLY**
- All tokens are worthless test tokens
- Never use a wallet with real funds
- Keep your testnet private key separate

⚠️ **PRIVATE KEY SAFETY**
- Never commit `.env` to GitHub (it's in `.gitignore`)
- Never share your private key
- Use a dedicated testnet wallet

---

## View Your Transactions

After each transaction, you can view it on BaseScan:

**https://sepolia.basescan.org/address/YOUR_WALLET_ADDRESS**

Replace `YOUR_WALLET_ADDRESS` with your actual wallet address.

---

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Read the error message carefully
3. Check BaseScan for transaction details
4. Make sure all prerequisites are installed

---

## Summary

✅ Clone repository
✅ Install dependencies
✅ Get Base Sepolia ETH
✅ Export private key
✅ Configure `.env`
✅ Deploy contracts
✅ Update contract addresses
✅ Start dev server
✅ Access http://localhost:5173/beta
✅ Test the faucet!

**You're all set!** 🎉
