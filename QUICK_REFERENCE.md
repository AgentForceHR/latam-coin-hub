# Estable DeFi - Quick Reference Card

## 🚀 Quick Deploy Commands

```bash
# 1. Deploy Smart Contracts
cd blockchain
npm install
npm run compile
npm run deploy:sepolia

# 2. Setup Frontend
cd ..
npm install
npm run build

# 3. Start Backend
cd server
npm install
npm start

# 4. Start Frontend (new terminal)
cd ..
npm run dev
```

---

## 📋 Contract Addresses Template

After deployment, fill in your addresses:

```env
ESTABLE_TOKEN_ADDRESS=0x
USD_STABLECOIN_ADDRESS=0x
BRL_STABLECOIN_ADDRESS=0x
ARS_STABLECOIN_ADDRESS=0x
MXN_STABLECOIN_ADDRESS=0x
COP_STABLECOIN_ADDRESS=0x
STAKING_ADDRESS=0x
MORPHO_ADAPTER_ADDRESS=0x
```

---

## 🪙 Token Information

| Token | Symbol | Type | Peg Ratio |
|-------|--------|------|-----------|
| Estable | EST | Governance | - |
| Estable USD | EUSD | Stablecoin | 1:1 |
| Estable BRL | EBRL | Stablecoin | ~5.5:1 |
| Estable ARS | EARS | Stablecoin | ~950:1 |
| Estable MXN | EMXN | Stablecoin | ~17:1 |
| Estable COP | ECOP | Stablecoin | ~4000:1 |

---

## 🔑 Required API Keys

1. **Alchemy** (Blockchain RPC)
   - https://www.alchemy.com/
   - Create app → Ethereum Sepolia
   - Copy API Key

2. **Etherscan** (Contract Verification)
   - https://etherscan.io/myapikey
   - Create API key

3. **MetaMask Private Key**
   - Account Details → Export Private Key
   - ⚠️ Never share or commit!

---

## 💧 Get Test ETH

**Need**: 0.15 SepoliaETH minimum

**Faucets**:
- https://sepoliafaucet.com/ (0.5 ETH)
- https://faucet.quicknode.com/ethereum/sepolia (0.1 ETH)
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia

---

## 📁 Key Files

```
project/
├── blockchain/
│   ├── contracts/
│   │   ├── EstableToken.sol        ← Governance token
│   │   ├── Stablecoin.sol          ← All stablecoins
│   │   ├── Staking.sol             ← EST staking
│   │   └── MorphoVaultAdapter.sol  ← Yield vaults
│   ├── scripts/
│   │   └── deploy.js               ← Deployment script
│   ├── .env                        ← Private keys/API keys
│   └── deployments.json            ← Contract addresses
│
├── src/
│   ├── config/
│   │   └── contracts.ts            ← Contract configuration
│   ├── lib/
│   │   └── translations.ts         ← Multilingual support
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Earn.tsx
│       ├── Borrow.tsx
│       ├── Governance.tsx
│       └── Beta.tsx
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   └── beta.ts            ← Beta sign-up API
│   │   └── server.ts              ← Main server
│   └── .env                       ← Backend config
│
└── supabase/
    └── migrations/                ← Database schemas
```

---

## 🌍 Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt)

Toggle via language switcher in app.

---

## 🔧 Verify Installation

```bash
# Check Node.js
node --version  # Should be 18+

# Check Git
git --version

# Check MetaMask
# Open browser, check for fox icon

# Check Sepolia ETH
# Open MetaMask, verify balance > 0.15
```

---

## 📊 Gas Costs (Sepolia)

| Action | Cost (ETH) |
|--------|------------|
| Deploy all contracts | ~0.10 |
| Mint stablecoin | ~0.001 |
| Stake tokens | ~0.002 |
| Vault deposit | ~0.003 |

**Total needed**: 0.15 ETH (includes buffer)

---

## ⚡ Common Commands

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Verify contract
npx hardhat verify --network sepolia 0xYOUR_ADDRESS

# Build frontend
npm run build

# Run frontend dev server
npm run dev

# Start backend server
npm start  # (in server/ folder)

# Check smart contract size
npm run compile && du -h artifacts/
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Insufficient funds | Get more from faucets |
| Network mismatch | Switch MetaMask to Sepolia |
| Cannot find EstableToken | Run `npm run compile` |
| Port 3001 in use | Change PORT in server/.env |
| Build fails | Delete node_modules, npm install |

---

## 🔗 Important Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Alchemy Dashboard**: https://dashboard.alchemy.com
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Morpho Docs**: https://docs.morpho.org
- **Hardhat Docs**: https://hardhat.org/docs

---

## 📞 Beta Sign-Up Endpoint

```javascript
// POST /api/beta/signup
{
  "email": "user@example.com",
  "nickname": "@username",
  "language": "es"  // or "en", "pt"
}

// GET /api/beta/count
// Returns remaining spots (max 100)
```

---

## ✅ Deployment Checklist

- [ ] Get 0.15+ SepoliaETH
- [ ] Get Alchemy API key
- [ ] Get Etherscan API key
- [ ] Export MetaMask private key
- [ ] cd blockchain && npm install
- [ ] Create blockchain/.env
- [ ] npm run compile
- [ ] npm run deploy:sepolia
- [ ] Save contract addresses
- [ ] Update root .env
- [ ] Update server/.env
- [ ] npm install (root)
- [ ] npm run build
- [ ] cd server && npm install
- [ ] npm start (server)
- [ ] npm run dev (frontend)
- [ ] Test in browser
- [ ] Connect MetaMask
- [ ] Test beta sign-up
- [ ] Verify on Etherscan

---

## 🎯 Testing URLs

**Local**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health
- Beta page: http://localhost:5173/beta

**Production** (after deploy):
- Frontend: https://your-app.vercel.app
- Backend: https://your-api.railway.app
- Beta page: https://your-app.vercel.app/beta

---

## 🔐 Security Reminders

- ⚠️ **NEVER** commit `.env` files
- ⚠️ **NEVER** share private keys
- ⚠️ Use separate testnet wallet
- ⚠️ Test thoroughly before mainnet
- ⚠️ Get professional audit for mainnet

---

## 📈 Next Steps After Deploy

1. Register Morpho vaults
2. Add price oracles
3. Test all stablecoin minting
4. Create governance proposals
5. Invite beta testers
6. Monitor Etherscan for transactions
7. Collect user feedback

---

**Version**: 2.0.0 (Estable)
**Network**: Sepolia Testnet
**Updated**: December 2024
