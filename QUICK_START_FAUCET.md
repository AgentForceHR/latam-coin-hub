# Quick Start: Beta Faucet System

Ultra-quick reference for deploying and testing the faucet system.

## 🚀 Deploy in 5 Minutes

```bash
# 1. Configure environment
echo "PRIVATE_KEY=0xYourKey" >> .env
echo "BASESCAN_API_KEY=YourKey" >> .env

# 2. Deploy contracts
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia

# 3. Update .env with addresses from deployments.json
# Copy from contracts/deployments.json to root .env

# 4. Start app
cd ..
npm run dev
```

## 📝 Environment Variables Checklist

```env
# Required for deployment
PRIVATE_KEY=0x...
BASESCAN_API_KEY=...

# Required for app (from deployment)
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_EST_TOKEN_ADDRESS=0x...
VITE_YIELD_VAULT_ADDRESS=0x...
VITE_EST_STAKE_ADDRESS=0x...
```

## 🧪 Test Flow (30 seconds)

1. Visit http://localhost:5173/beta
2. Connect wallet → Auto-switches to Base Sepolia
3. Tab: "Gas Faucets" → Get test ETH
4. Tab: "Test Tokens" → Click "Claim Test Tokens"
5. Tab: "Quick Demo" → Run 4-step demo
6. Visit http://localhost:5173/beta/test for full dashboard

## 📦 What Was Built

### Components
- **TokenFaucet** - Claims 1K mUSDC + 1K mUSDT + 1K EST
- **GasFaucet** - Links to 4 Base Sepolia faucets
- **DemoFlow** - 4-step guided demo (deposit → stake → simulate → check)

### Features
- ✅ 24-hour cooldown via localStorage
- ✅ Auto-approval for vault contracts
- ✅ Real-time countdown timer
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Error handling

## 🔗 Important Links

- **BaseScan:** https://sepolia.basescan.org
- **Base Faucet:** https://www.base.org/faucets
- **Circle Faucet:** https://faucet.circle.com
- **Hardhat Docs:** https://hardhat.org/docs

## 💰 Gas Estimates

| Action | Gas | Cost (ETH) |
|--------|-----|------------|
| Deploy All | ~7.5M | ~0.0075 |
| Claim Tokens | ~150K | ~0.00015 |
| Full Demo | ~500K | ~0.0005 |

## ⚠️ Common Issues

**"Contract addresses not configured"**
→ Update `.env` with deployed addresses, restart server

**"Insufficient funds"**
→ Get Base Sepolia ETH from faucets

**"Network mismatch"**
→ App auto-switches to Base Sepolia (84532)

**"Please wait before claiming"**
→ 24h cooldown active (clear localStorage to reset for testing)

## 📚 Full Documentation

- **Setup:** `BETA_FAUCET_SETUP.md`
- **Deployment:** `BETA_DEPLOYMENT_INSTRUCTIONS.md`
- **Summary:** `BETA_FAUCET_IMPLEMENTATION_SUMMARY.md`

## 🎯 Success Criteria

- [ ] All contracts deployed
- [ ] Env variables updated
- [ ] Wallet connects
- [ ] Tokens claimable
- [ ] Demo completes
- [ ] No console errors

---

**Ready to ship? Run:** `npm run build` → Deploy to production!
