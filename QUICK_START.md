# 🚀 LATAM DeFi MVP - Quick Start Guide

## What You Have Now

✅ **Frontend** - React app with UI for DeFi operations
✅ **Backend** - Express API with database
✅ **Smart Contracts** - Ready to deploy on BSC testnet
✅ **Database** - Supabase with all tables created

## Turn It Into a Real MVP (30 Minutes)

### Step 1: Get Test BNB (5 minutes)

1. Install MetaMask: https://metamask.io/download/
2. Create a new wallet (SAVE YOUR SEED PHRASE!)
3. Copy your wallet address (0x...)
4. Go to https://testnet.bnbchain.org/faucet-smart
5. Paste address, get test BNB
6. Add BSC Testnet to MetaMask:
   - Network: BSC Testnet
   - RPC: `https://data-seed-prebsc-1-s1.bnbchain.org:8545`
   - Chain ID: 97
   - Symbol: BNB

### Step 2: Deploy Smart Contracts (10 minutes)

```bash
# Go to blockchain folder
cd blockchain

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Add your MetaMask private key

# Deploy to BSC testnet
npm run deploy:testnet
```

**Copy the contract addresses that appear!** You'll need them next.

### Step 3: Connect Frontend (5 minutes)

```bash
# Go to frontend
cd ..

# Install Web3 dependencies
npm install ethers@6

# Create config file
mkdir -p src/config
```

Create `src/config/web3.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  latamToken: '0x...YOUR_LATAM_TOKEN_ADDRESS',
  usdStablecoin: '0x...YOUR_USD_ADDRESS',
  brlStablecoin: '0x...YOUR_BRL_ADDRESS',
  arsStablecoin: '0x...YOUR_ARS_ADDRESS',
  staking: '0x...YOUR_STAKING_ADDRESS'
};

export const BSC_TESTNET = {
  chainId: 97,
  rpcUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545'
};
```

### Step 4: Update Backend (5 minutes)

```bash
# Go to backend
cd server

# Add to .env
echo "BSC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545" >> .env
echo "LATAM_TOKEN_ADDRESS=0x...YOUR_ADDRESS" >> .env
```

### Step 5: Test Everything (5 minutes)

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd ..
npm run dev

# Terminal 3: Open browser
# Visit: http://localhost:5173
```

**Test Flow:**
1. Click "Connect Wallet"
2. Connect MetaMask
3. Try minting a stablecoin
4. Check transaction on: https://testnet.bscscan.com

## 🎉 You're Live!

Your app is now:
- ✅ Using real blockchain
- ✅ Real wallet connection
- ✅ Real transactions
- ✅ On BSC testnet

## Next Steps

### Make It Better
1. **Add loading states** - Show "Transaction pending..."
2. **Error handling** - Better error messages
3. **Transaction history** - Show recent transactions
4. **Real-time updates** - Update balances automatically

### Go to Mainnet (When Ready)
1. Test EVERYTHING on testnet first
2. Get contract audited
3. Get real BNB
4. Deploy to mainnet
5. Monitor closely

## Common Issues

### "MetaMask not connecting"
→ Make sure you're on BSC Testnet network

### "Transaction failed"
→ Need more test BNB for gas

### "Contract not found"
→ Check contract addresses in config

### "Insufficient funds"
→ Get more test BNB from faucet

## Resources

- **BSC Testnet Explorer**: https://testnet.bscscan.com
- **Test BNB Faucet**: https://testnet.bnbchain.org/faucet-smart
- **MetaMask Help**: https://metamask.io/support
- **Hardhat Docs**: https://hardhat.org/docs

## Cost to Deploy to Mainnet

- Smart Contracts: ~$10-20 in BNB
- Each transaction: ~$0.20-0.50
- Monthly hosting: Free (using Vercel + Supabase free tiers)

## Support

If you get stuck:
1. Check the error message
2. Look in browser console (F12)
3. Check BSCScan for transaction details
4. Review the MVP_IMPLEMENTATION_GUIDE.md

## What You Built

🏆 **A real DeFi platform with:**
- Native token (LATAM)
- 3 stablecoins (USD, BRL, ARS)
- Staking mechanism
- Real blockchain integration
- Full frontend + backend

**Congratulations! You're now a DeFi developer!** 🚀
