# Estable DeFi - Complete Sepolia Deployment Guide

Deploy the complete Estable DeFi platform with EST token and 5 stablecoins (USD, BRL, ARS, MXN, COP) to Sepolia testnet.

---

## What's New in Est Token

- **Native Token**: Changed from "LATAM" to "Estable" (EST)
- **Stablecoins**: Now supports 5 currencies:
  - USD (1:1)
  - BRL - Brazilian Real (~5.5:1)
  - ARS - Argentine Peso (~950:1)
  - MXN - Mexican Peso (~17:1) **NEW**
  - COP - Colombian Peso (~4000:1) **NEW**

---

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] MetaMask wallet with 0.1+ Sepolia ETH
- [ ] Alchemy API key
- [ ] Etherscan API key (optional)

---

## Part 1: Get Test ETH

1. Create MetaMask wallet and switch to Sepolia network
2. Get free test ETH from:
   - https://sepoliafaucet.com/ (0.5 ETH)
   - https://faucet.quicknode.com/ethereum/sepolia (0.1 ETH)
3. Verify you have at least 0.15 SepoliaETH

---

## Part 2: Deploy Smart Contracts

### Step 1: Setup Project

```bash
cd your-project-folder
cd blockchain
npm install
```

### Step 2: Configure Environment

Create `.env` file in `blockchain` folder:

```env
PRIVATE_KEY=0xYourMetaMaskPrivateKey
ALCHEMY_API_KEY=YourAlchemyKey
ETHERSCAN_API_KEY=YourEtherscanKey
```

**Get Keys:**
- Private Key: MetaMask → Account Details → Export Private Key
- Alchemy: https://www.alchemy.com/ → Create App (Ethereum Sepolia)
- Etherscan: https://etherscan.io/myapikey

### Step 3: Compile Contracts

```bash
npm run compile
```

You should see: `Compiled X Solidity files successfully`

### Step 4: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**What gets deployed (8 contracts):**
1. Estable Token (EST) - Governance token
2. EUSD - USD Stablecoin
3. EBRL - Brazilian Real Stablecoin
4. EARS - Argentine Peso Stablecoin
5. EMXN - Mexican Peso Stablecoin (NEW)
6. ECOP - Colombian Peso Stablecoin (NEW)
7. Staking Contract
8. Morpho Vault Adapter

**Deployment Time:** 4-6 minutes

**Cost:** ~0.08-0.12 SepoliaETH

### Step 5: Save Contract Addresses

After deployment, you'll see:

```json
{
  "estableToken": "0x1234...",
  "usdStablecoin": "0xabcd...",
  "brlStablecoin": "0x5678...",
  "arsStablecoin": "0xef01...",
  "mxnStablecoin": "0x9abc...",
  "copStablecoin": "0xdef2...",
  "staking": "0x3456...",
  "morphoAdapter": "0x7890..."
}
```

**SAVE THESE ADDRESSES!** Copy to a text file named `contract-addresses.txt`

### Step 6: Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

Repeat for all 8 contracts.

---

## Part 3: Configure Frontend

### Step 1: Go to Project Root

```bash
cd ..
```

### Step 2: Update Environment Variables

Edit `.env` file in project root and add your contract addresses:

```env
# Blockchain Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
VITE_NETWORK_NAME=Sepolia

# Contract Addresses
VITE_ESTABLE_TOKEN_ADDRESS=0xYourEstableTokenAddress
VITE_USD_STABLECOIN_ADDRESS=0xYourUSDAddress
VITE_BRL_STABLECOIN_ADDRESS=0xYourBRLAddress
VITE_ARS_STABLECOIN_ADDRESS=0xYourARSAddress
VITE_MXN_STABLECOIN_ADDRESS=0xYourMXNAddress
VITE_COP_STABLECOIN_ADDRESS=0xYourCOPAddress
VITE_STAKING_ADDRESS=0xYourStakingAddress
VITE_MORPHO_ADAPTER_ADDRESS=0xYourMorphoAddress

# Backend API
VITE_API_URL=http://localhost:3001
```

### Step 3: Install and Build

```bash
npm install
npm run build
```

Build should complete with: `✓ built in Xs`

---

## Part 4: Configure Backend

### Step 1: Navigate to Server

```bash
cd server
npm install
```

### Step 2: Update Server Environment

Create/edit `server/.env`:

```env
PORT=3001
NODE_ENV=development

# Supabase (keep existing values)
SUPABASE_URL=your_existing_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_existing_key
JWT_SECRET=your_existing_secret

# Blockchain Configuration
BLOCKCHAIN_NETWORK=sepolia
CHAIN_ID=11155111
RPC_URL=https://rpc.sepolia.org

# Contract Addresses
ESTABLE_TOKEN_ADDRESS=0xYourEstableTokenAddress
USD_STABLECOIN_ADDRESS=0xYourUSDAddress
BRL_STABLECOIN_ADDRESS=0xYourBRLAddress
ARS_STABLECOIN_ADDRESS=0xYourARSAddress
MXN_STABLECOIN_ADDRESS=0xYourMXNAddress
COP_STABLECOIN_ADDRESS=0xYourCOPAddress
STAKING_ADDRESS=0xYourStakingAddress
MORPHO_ADAPTER_ADDRESS=0xYourMorphoAddress

# Optional: Twitter API for beta verification
X_BEARER_TOKEN=your_twitter_token
```

---

## Part 5: Test Locally

### Terminal 1 - Start Backend

```bash
cd server
npm start
```

Should see: `Estable DeFi API server running on port 3001`

### Terminal 2 - Start Frontend

```bash
cd ..
npm run dev
```

Should see: `Local: http://localhost:5173/`

### Test in Browser

1. Open http://localhost:5173
2. Connect MetaMask (make sure Sepolia is selected)
3. Test navigation:
   - Dashboard
   - Earn page
   - Borrow page
   - Governance
   - Beta sign-up at `/beta`

---

## Part 6: Production Deployment

### Backend (Railway)

1. Go to https://railway.app/
2. Login with GitHub
3. New Project → Deploy from GitHub repo
4. Settings → Root Directory: `server`
5. Variables → Add all from `server/.env`
6. Copy generated URL (e.g., `https://estable-api.railway.app`)

### Frontend (Vercel)

1. Go to https://vercel.com/
2. Login with GitHub
3. Import Project → Select repository
4. Framework: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Environment Variables:
   - Add all `VITE_*` variables from `.env`
   - Update `VITE_API_URL` with Railway URL
8. Deploy
9. Your app is live at `https://your-app.vercel.app`

---

## Part 7: Verification

### Check Contracts on Etherscan

Visit: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

You should see:
- Contract creation transaction
- Current balance
- Transaction history

### Test All Features

1. **Connect Wallet**
   - MetaMask should popup
   - Switch to Sepolia if needed
   - Wallet address appears in navbar

2. **Beta Sign-Up**
   - Visit `/beta`
   - Fill in email and nickname
   - Submit form
   - Check Supabase for entry

3. **Dashboard**
   - View portfolio
   - Check stablecoin balances
   - See staking information

4. **Test Transactions**
   - Try minting a stablecoin
   - MetaMask confirms transaction
   - Wait for confirmation
   - Check Etherscan for transaction

---

## Deployed Contract Summary

| Contract | Symbol | Purpose | Peg Ratio |
|----------|--------|---------|-----------|
| Estable Token | EST | Governance & Utility | - |
| USD Stablecoin | EUSD | US Dollar | 1:1 |
| BRL Stablecoin | EBRL | Brazilian Real | ~5.5:1 |
| ARS Stablecoin | EARS | Argentine Peso | ~950:1 |
| MXN Stablecoin | EMXN | Mexican Peso | ~17:1 |
| COP Stablecoin | ECOP | Colombian Peso | ~4000:1 |
| Staking | - | Stake EST tokens | - |
| Morpho Adapter | - | Yield vaults | - |

---

## Troubleshooting

### "Insufficient funds"
- Need at least 0.15 SepoliaETH
- Get more from faucets listed above

### "Network mismatch"
- Open MetaMask
- Switch to "Sepolia Test Network"
- Refresh page

### "Cannot find module EstableToken"
- Run `npm run compile` in blockchain folder
- Check `EstableToken.sol` exists in `contracts/`

### Deployment fails
- Verify `.env` has correct private key
- Check Alchemy API key is valid
- Ensure enough SepoliaETH
- Try again (network might be slow)

### Frontend build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Run `npm run build`

### Backend won't start
- Check all environment variables in `server/.env`
- Verify Supabase credentials
- Try different port if 3001 is busy

---

## Key Differences from LATAM Token

### Token Branding
- **Old**: LATAM Token → **New**: Estable Token (EST)
- All governance references updated
- Staking rewards use EST tokens

### Stablecoin Naming
- **Old**: LUSD, LBRL, LARS
- **New**: EUSD, EBRL, EARS, EMXN, ECOP

### New Currencies
- Added MXN (Mexican Peso) support
- Added COP (Colombian Peso) support
- Database supports all 5 currencies
- Frontend translations updated

---

## Gas Estimates (Sepolia)

- Deploy all 8 contracts: ~0.10 ETH
- Mint stablecoin: ~0.001 ETH
- Stake tokens: ~0.002 ETH
- Vault deposit: ~0.003 ETH

**Total for full deployment + testing: ~0.12 ETH**

---

## Important Files to Keep

1. `blockchain/deployments.json` - All contract addresses
2. `contract-addresses.txt` - Backup of addresses
3. `.env` files - Environment variables (NEVER commit these!)
4. Private key backup (stored securely offline)

---

## Next Steps After Deployment

1. **Register Morpho Vaults**
   - Find Sepolia Morpho vault addresses
   - Call `registerVault()` on MorphoVaultAdapter
   - Test deposits and withdrawals

2. **Add Liquidity**
   - Mint test stablecoins
   - Provide liquidity to vaults
   - Test earning yields

3. **Create Governance Proposals**
   - Stake EST tokens
   - Create test proposals
   - Practice voting

4. **Invite Beta Testers**
   - Share beta sign-up link
   - Monitor Supabase for sign-ups
   - Collect feedback

---

## Security Checklist

- [ ] Using testnet wallet only (not main wallet)
- [ ] Never share private keys
- [ ] `.env` files in `.gitignore`
- [ ] All contracts verified on Etherscan
- [ ] Rate limiting enabled on backend
- [ ] CORS properly configured
- [ ] Supabase RLS policies active

---

## Support Resources

- **Sepolia Faucets**: https://sepoliafaucet.com/
- **Etherscan**: https://sepolia.etherscan.io
- **Alchemy Docs**: https://docs.alchemy.com/
- **Hardhat Docs**: https://hardhat.org/docs
- **Morpho Docs**: https://docs.morpho.org/

---

## Estimated Completion Time

- First-time deployment: 2-3 hours
- Subsequent deployments: 30-45 minutes
- Testing: 1 hour minimum

---

**Congratulations!** You've deployed Estable DeFi with 5 stablecoins to Sepolia testnet. 🎉

Your platform now supports USD, BRL, ARS, MXN, and COP stablecoins with the EST governance token.
