# 🚀 START HERE - Quick Guide to Access Beta

This is the simplest guide to get you up and running with the LATAM Coin Hub Beta.

---

## ✅ What You Need

1. **Node.js** v18+ → [Download](https://nodejs.org/)
2. **MetaMask** wallet → [Install](https://metamask.io/)
3. **Base Sepolia ETH** → [Get free testnet ETH](https://www.base.org/faucets)
4. **Your GitHub Repository** → https://github.com/AgentForceHR/latam-coin-hub

---

## 📋 Step-by-Step (5 Minutes)

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git
cd latam-coin-hub
```

### Step 2: Install Dependencies

```bash
npm install
cd contracts
npm install
cd ..
```

### Step 3: Get Base Sepolia Test ETH

1. Go to https://www.base.org/faucets
2. Connect your MetaMask
3. Request Base Sepolia ETH (free testnet tokens)

### Step 4: Add Your Private Key

**⚠️ Use a TEST wallet only! Never use real funds!**

```bash
cp .env.example .env
nano .env
```

Find this line:
```
PRIVATE_KEY=
```

Change it to:
```
PRIVATE_KEY=0xYourTestWalletPrivateKey
```

Save and exit (Ctrl+X, Y, Enter).

### Step 5: Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia
```

**Important:** Copy all the contract addresses from the output!

### Step 6: Update .env with Addresses

```bash
cd ..
nano .env
```

Add these lines with your actual deployed addresses:
```
VITE_MOCK_USDC_ADDRESS=0xYourAddressHere
VITE_MOCK_USDT_ADDRESS=0xYourAddressHere
VITE_EST_TOKEN_ADDRESS=0xYourAddressHere
VITE_YIELD_VAULT_ADDRESS=0xYourAddressHere
VITE_EST_STAKE_ADDRESS=0xYourAddressHere
```

Save and exit.

### Step 7: Start the App

```bash
npm run dev
```

### Step 8: Open Beta Page

Go to: **http://localhost:5173/beta**

---

## 🎯 Quick Alternative (Using Setup Script)

For Mac/Linux users:

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git
cd latam-coin-hub
chmod +x quick-setup.sh
./quick-setup.sh
```

Select option 5 (Run all steps).

**Note:** You still need to add your PRIVATE_KEY to `.env` before running the script.

---

## 🔧 If Something Goes Wrong

### "Cannot find module"
```bash
npm install
cd contracts && npm install
```

### "Insufficient funds"
- Get more Base Sepolia ETH from https://www.base.org/faucets
- Make sure you're using Base Sepolia network (Chain ID: 84532)

### "Private key invalid"
- Make sure your private key starts with `0x`
- Check there are no spaces or quotes around it

### "Port 5173 already in use"
```bash
pkill -f vite
npm run dev
```

---

## 📚 More Help

- **Full Setup Guide:** Read `SETUP_GUIDE.md`
- **All Terminal Commands:** Read `TERMINAL_COMMANDS.md`
- **Quick Commands:** Use `./quick-setup.sh` script

---

## 🎉 You're Done!

Once the dev server is running:

1. Open http://localhost:5173/beta
2. Click "Connect Wallet"
3. Select MetaMask
4. Make sure you're on **Base Sepolia** network
5. Use the faucet to get test tokens
6. Test staking and vault features

---

## 🔒 Security Reminders

- ⚠️ Only use a TEST wallet
- ⚠️ Never use real funds
- ⚠️ Never commit `.env` to GitHub
- ⚠️ These are worthless test tokens only

---

## 📞 Quick Checklist

Before asking for help, verify:

- [ ] Node.js v18+ installed (`node --version`)
- [ ] `.env` file exists and has PRIVATE_KEY
- [ ] You have Base Sepolia ETH in your wallet
- [ ] Contracts are deployed (`cat contracts/deployments.json`)
- [ ] Contract addresses are in `.env`
- [ ] MetaMask is installed and connected to Base Sepolia

---

## 🌐 View Your Transactions

After any transaction, view it on BaseScan:

**https://sepolia.basescan.org/**

---

## ⚡ The Absolute Fastest Way

If you just want to run it without understanding:

```bash
git clone https://github.com/AgentForceHR/latam-coin-hub.git && cd latam-coin-hub && npm install && cd contracts && npm install && cd .. && cp .env.example .env
```

Then:
1. Edit `.env` and add your `PRIVATE_KEY=0x...`
2. Run: `cd contracts && npx hardhat compile && npx hardhat run scripts/deploy.ts --network baseSepolia`
3. Copy contract addresses to `.env`
4. Run: `npm run dev`
5. Open: http://localhost:5173/beta

Done! 🎉

---

**Need detailed instructions?** → Read `SETUP_GUIDE.md`

**Need copy-paste commands?** → Read `TERMINAL_COMMANDS.md`

**Want automated setup?** → Run `./quick-setup.sh`
