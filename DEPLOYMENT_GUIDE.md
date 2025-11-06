# Estable DeFi Platform - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the Estable DeFi platform, including smart contracts, backend API, and frontend application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Smart Contracts Deployment](#smart-contracts-deployment)
3. [Database Setup](#database-setup)
4. [Backend API Deployment](#backend-api-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Prerequisites

### Required Tools
- **Node.js**: v18+ and npm
- **Git**: Latest version
- **Hardhat**: For smart contract deployment
- **Supabase Account**: For database and authentication
- **BNB Testnet Tokens**: For contract deployment (get from [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart))

### Required Accounts
- BSC Testnet wallet with test BNB (~0.1 BNB)
- Supabase project
- BscScan API key (optional, for contract verification)

---

## Smart Contracts Deployment

### Step 1: Setup Environment

```bash
cd blockchain
npm install
```

Create a `.env` file in the `blockchain` directory:

```env
PRIVATE_KEY=your_wallet_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### Step 2: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 8 Solidity files successfully
```

### Step 3: Deploy to BSC Testnet

```bash
npm run deploy:testnet
```

**Deployed Contracts:**
1. **EstableToken (EST)** - Governance token
   - Symbol: EST
   - Max Supply: 1 billion tokens
   - Initial Supply: 100 million tokens

2. **Stablecoins**:
   - **EUSD** - USD-pegged (1:1)
   - **EBRL** - Brazilian Real-pegged (5.5:1)
   - **EARS** - Argentine Peso-pegged (950:1)
   - **EMXN** - Mexican Peso-pegged (17:1)
   - **ECOP** - Colombian Peso-pegged (4000:1)

3. **Staking Contract** - For EST token staking
   - Lock periods: 3-12 months
   - APY: 5-15% based on lock duration

4. **MorphoVaultAdapter** - Integration with Morpho Blue protocol

### Step 4: Save Deployment Addresses

After deployment, contract addresses are saved in `blockchain/deployments.json`:

```json
{
  "estableToken": "0x...",
  "usdStablecoin": "0x...",
  "brlStablecoin": "0x...",
  "arsStablecoin": "0x...",
  "mxnStablecoin": "0x...",
  "copStablecoin": "0x...",
  "staking": "0x...",
  "morphoAdapter": "0x..."
}
```

**Important:** Keep these addresses for backend and frontend configuration!

### Step 5: Verify Contracts (Optional)

```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your project URL and API keys

### Step 2: Run Migrations

The migrations are located in `supabase/migrations/`:

1. **20251012172314_create_latam_defi_schema.sql** - Main database schema
   - Creates all core tables (users, stablecoins, transactions, vaults, etc.)
   - Sets up Row Level Security (RLS) policies
   - Creates indexes for performance

2. **20251012180650_create_morpho_positions_table.sql** - Morpho integration
   - Creates positions tracking for Morpho vaults

3. **20251017142730_create_soldefi_landing_content.sql** - Landing page content
   - Creates content management tables

4. **20251017142754_create_soldefi_app_tables.sql** - App-specific tables
   - Additional tables for app functionality

5. **20251024140113_create_beta_testers_table.sql** - Beta program
   - Beta tester registration table

6. **20251105164808_add_mxn_cop_stablecoins.sql** - MXN & COP support
   - Updates stablecoins table to support MXN and COP

### Running Migrations

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor in your Supabase project
2. Copy and paste each migration file in order
3. Execute each migration

**Option B: Via Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 3: Verify Database Schema

Check that all tables exist:
- users
- stablecoins (supports: USD, BRL, ARS, MXN, COP)
- transactions
- vaults
- positions
- yields
- stakes
- proposals
- votes
- revenue
- morpho_positions
- beta_testers

---

## Backend API Deployment

### Step 1: Setup Environment

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-secure-random-jwt-secret-here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100

# Smart Contract Addresses (from deployment)
ESTABLE_TOKEN_ADDRESS=0x...
USD_STABLECOIN_ADDRESS=0x...
BRL_STABLECOIN_ADDRESS=0x...
ARS_STABLECOIN_ADDRESS=0x...
MXN_STABLECOIN_ADDRESS=0x...
COP_STABLECOIN_ADDRESS=0x...
STAKING_ADDRESS=0x...
MORPHO_ADAPTER_ADDRESS=0x...

# BSC RPC
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.bnbchain.org:8545
```

### Step 2: Build and Start

```bash
# Build TypeScript
npm run build

# Start production server
npm run start
```

### Step 3: Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "Estable API",
  "version": "1.0.0"
}
```

### API Endpoints Overview

**Authentication:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

**Stablecoins:**
- POST `/api/stablecoin/mint` - Mint stablecoins (USD, BRL, ARS, MXN, COP)
- POST `/api/stablecoin/redeem` - Redeem stablecoins

**Vaults:**
- GET `/api/vaults` - List available Morpho vaults
- POST `/api/vaults/deposit` - Deposit into vault
- POST `/api/vaults/withdraw` - Withdraw from vault

**Governance:**
- GET `/api/governance/proposals` - List proposals
- POST `/api/governance/vote` - Vote on proposal
- POST `/api/governance/stake` - Stake EST tokens
- POST `/api/governance/unstake` - Unstake EST tokens

**Beta:**
- POST `/api/beta/register` - Register for beta program
- GET `/api/beta/count` - Get beta tester count

---

## Frontend Deployment

### Step 1: Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-api-url.com/api

# Smart Contract Addresses
VITE_ESTABLE_TOKEN_ADDRESS=0x...
VITE_USD_STABLECOIN_ADDRESS=0x...
VITE_BRL_STABLECOIN_ADDRESS=0x...
VITE_ARS_STABLECOIN_ADDRESS=0x...
VITE_MXN_STABLECOIN_ADDRESS=0x...
VITE_COP_STABLECOIN_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_MORPHO_ADAPTER_ADDRESS=0x...

# Network Configuration
VITE_CHAIN_ID=97
VITE_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
```

### Step 2: Build Frontend

```bash
npm install
npm run build
```

### Step 3: Deploy to Hosting

**Option A: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: Traditional Hosting**
Upload the `dist` folder to your web server.

---

## Post-Deployment Verification

### 1. Smart Contracts Verification

Check all contracts on [BSC Testnet Explorer](https://testnet.bscscan.com):
- ✅ EstableToken deployed and verified
- ✅ All 5 stablecoins deployed (USD, BRL, ARS, MXN, COP)
- ✅ Staking contract deployed
- ✅ Morpho adapter deployed

### 2. Database Verification

In Supabase SQL Editor, run:

```sql
-- Check stablecoins table constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%stablecoins%';

-- Expected: CHECK (symbol IN ('USD', 'BRL', 'ARS', 'MXN', 'COP'))
```

### 3. Backend API Verification

Test all endpoints:
```bash
# Health check
curl https://your-api.com/api/health

# Test authentication
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","language":"en"}'
```

### 4. Frontend Verification

- ✅ Landing page loads correctly
- ✅ Language switcher works (EN/ES/PT)
- ✅ All navigation links work
- ✅ Wallet connection interface displays
- ✅ Dashboard displays correctly
- ✅ All 5 stablecoins show in UI (USD, BRL, ARS, MXN, COP)

### 5. End-to-End Test

1. **Register Account**: Create new user account
2. **Mint Stablecoin**: Try minting each stablecoin type
3. **Deposit to Vault**: Deposit into a Morpho vault
4. **Stake EST**: Stake some EST tokens
5. **Vote**: Vote on a governance proposal

---

## Supported Stablecoins

| Symbol | Currency | Peg Rate | Example |
|--------|----------|----------|---------|
| EUSD | US Dollar | 1:1 | 1 USD = 1 EUSD |
| EBRL | Brazilian Real | 5.5:1 | 1 USD = 5.5 EBRL |
| EARS | Argentine Peso | 950:1 | 1 USD = 950 EARS |
| EMXN | Mexican Peso | 17:1 | 1 USD = 17 EMXN |
| ECOP | Colombian Peso | 4000:1 | 1 USD = 4000 ECOP |

---

## Troubleshooting

### Smart Contract Deployment Issues

**Error: Insufficient funds**
- Solution: Get more test BNB from the faucet

**Error: Nonce too high**
- Solution: Reset your account in MetaMask (Settings > Advanced > Reset Account)

### Database Issues

**Error: Permission denied**
- Check RLS policies are correctly set up
- Verify user authentication is working

**Error: Foreign key constraint**
- Ensure migrations are run in the correct order

### Backend API Issues

**Error: CORS**
- Check FRONTEND_URL is correctly set in `.env`
- Verify CORS middleware configuration

**Error: Database connection**
- Verify Supabase credentials
- Check network connectivity

### Frontend Issues

**Error: Can't connect to wallet**
- Ensure MetaMask is installed
- Switch to BSC Testnet (Chain ID: 97)
- Add BSC Testnet to MetaMask if not present

**Error: Contract not found**
- Verify contract addresses in `.env`
- Ensure contracts are deployed on correct network

---

## Security Checklist

- [ ] All `.env` files contain production values
- [ ] Supabase RLS policies are enabled on all tables
- [ ] JWT_SECRET is a strong, random string
- [ ] Private keys are never committed to git
- [ ] API rate limiting is configured
- [ ] CORS is properly configured
- [ ] Smart contracts are verified on BSCScan
- [ ] Database backups are configured

---

## Maintenance

### Monitoring

Monitor these metrics:
- API response times
- Database query performance
- Smart contract gas usage
- Error rates
- User activity

### Updates

To update the platform:
1. Test changes on development/staging
2. Deploy new smart contracts if needed
3. Run new database migrations
4. Update backend API
5. Deploy new frontend build
6. Verify all components work together

---

## Support

For issues or questions:
- Check GitHub Issues
- Review smart contract documentation
- Contact the development team

---

## Quick Reference

### Network Information
- **Network**: BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.bnbchain.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

### Gas Estimates (BSC Testnet)
- EstableToken: ~0.005 BNB
- Each Stablecoin: ~0.004 BNB
- Staking Contract: ~0.006 BNB
- Morpho Adapter: ~0.005 BNB
- **Total**: ~0.033 BNB

### Important Links
- Frontend: Your deployed frontend URL
- Backend API: Your deployed backend URL
- Block Explorer: https://testnet.bscscan.com
- Supabase Dashboard: https://supabase.com/dashboard
