# Beta Faucet Deployment Instructions

Quick guide to deploy smart contracts and configure the beta testing faucet system.

## Prerequisites

1. **Base Sepolia ETH** - Get from https://www.base.org/faucets
2. **Private Key** - Export from MetaMask (Account Details > Show Private Key)
3. **BaseScan API Key** - Get from https://basescan.org/myapikey (optional, for verification)

## Step 1: Configure Environment

1. Open `.env` file in project root
2. Add your private key and API key:

```env
PRIVATE_KEY=0xYourPrivateKeyHere
BASESCAN_API_KEY=YourBaseScanApiKeyHere
```

⚠️ **WARNING:** Never commit `.env` file to version control!

## Step 2: Deploy Smart Contracts

Run the following commands:

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies (if not already done)
npm install

# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║   Estable Beta Contracts Deployment - Base Sepolia       ║
╚═══════════════════════════════════════════════════════════╝

📋 Deployment Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deployer Address:  0x...
Network:           baseSepolia
Chain ID:          84532
Deployer Balance:  0.xxx ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Deploying MockUSDC...
✅ MockUSDC deployed to: 0x...

2️⃣  Deploying MockUSDT...
✅ MockUSDT deployed to: 0x...

3️⃣  Deploying EstToken...
✅ EstToken deployed to: 0x...

4️⃣  Deploying YieldVault...
✅ YieldVault deployed to: 0x...
   Adding supported assets...
   ✓ Added mUSDC
   ✓ Added mUSDT

5️⃣  Deploying EstStake...
✅ EstStake deployed to: 0x...

╔═══════════════════════════════════════════════════════════╗
║              DEPLOYMENT SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝

Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MockUSDC:     0x...
MockUSDT:     0x...
EstToken:     0x...
YieldVault:   0x...
EstStake:     0x...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 3: Update Environment Variables

1. Copy addresses from deployment output
2. Open `.env` file in project root
3. Update the following variables:

```env
VITE_MOCK_USDC_ADDRESS=0xYourMockUSDCAddress
VITE_MOCK_USDT_ADDRESS=0xYourMockUSDTAddress
VITE_EST_TOKEN_ADDRESS=0xYourEstTokenAddress
VITE_YIELD_VAULT_ADDRESS=0xYourYieldVaultAddress
VITE_EST_STAKE_ADDRESS=0xYourEstStakeAddress
```

**Or use the deployment JSON:**
```bash
# Addresses are also saved in contracts/deployments.json
cat contracts/deployments.json
```

## Step 4: Verify Contracts (Optional)

Verify each contract on BaseScan for transparency:

```bash
# From contracts directory
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network baseSepolia 0xYourMockUSDCAddress
npx hardhat verify --network baseSepolia 0xYourMockUSDTAddress
npx hardhat verify --network baseSepolia 0xYourEstTokenAddress
npx hardhat verify --network baseSepolia 0xYourYieldVaultAddress 0xYourEstTokenAddress "Estable Yield Vault" "eyvUSD"
npx hardhat verify --network baseSepolia 0xYourEstStakeAddress 0xYourEstTokenAddress
```

## Step 5: Restart Development Server

```bash
# Return to project root
cd ..

# Restart the dev server to load new env variables
npm run dev
```

## Step 6: Test the Faucet

1. Visit http://localhost:5173/beta
2. Connect your wallet (MetaMask or Rabby)
3. Switch to Base Sepolia if prompted
4. Navigate to "Gas Faucets" tab first
5. Get test ETH from any faucet
6. Return to "Test Tokens" tab
7. Click "Claim Test Tokens"
8. Confirm transactions in wallet
9. Check balances on "Quick Demo" tab

## Verification Checklist

- [ ] All 5 contracts deployed successfully
- [ ] Contract addresses copied to `.env`
- [ ] Development server restarted
- [ ] Wallet connected to Base Sepolia
- [ ] Test ETH obtained for gas
- [ ] Token claim transaction confirmed
- [ ] Tokens received (check wallet or BaseScan)
- [ ] Auto-approval completed
- [ ] Demo flow works end-to-end
- [ ] 24-hour cooldown displays correctly

## Common Issues

### Issue: "Insufficient funds for gas"
**Solution:** Get Base Sepolia ETH from https://www.base.org/faucets

### Issue: "Contract addresses not configured"
**Solution:**
1. Check `.env` file has all addresses
2. Ensure no typos in addresses
3. Restart dev server after updating `.env`

### Issue: "Network mismatch"
**Solution:** Wallet will auto-switch to Base Sepolia, or manually switch in wallet settings

### Issue: "Transaction reverted"
**Solution:**
1. Check you have enough gas
2. Verify contract addresses are correct
3. Check console for error details

### Issue: "Please wait before claiming again"
**Solution:**
- Normal behavior if claimed within last 24 hours
- For testing: Clear browser localStorage and reload

## Gas Cost Estimates

Based on Base Sepolia network:

| Operation | Gas Used | Cost (ETH) |
|-----------|----------|------------|
| Deploy MockUSDC | ~900,000 | ~0.0009 |
| Deploy MockUSDT | ~900,000 | ~0.0009 |
| Deploy EstToken | ~1,200,000 | ~0.0012 |
| Deploy YieldVault | ~2,500,000 | ~0.0025 |
| Deploy EstStake | ~2,000,000 | ~0.0020 |
| **Total Deployment** | **~7,500,000** | **~0.0075 ETH** |
| Claim Tokens | ~150,000 | ~0.00015 |
| Approve Token | ~50,000 | ~0.00005 |
| Deposit | ~100,000 | ~0.0001 |
| Stake EST | ~80,000 | ~0.00008 |

**Total for deployment:** ~0.0075 ETH
**Total for user testing:** ~0.0004 ETH per test session

## Contract Functions Available

### MockUSDC / MockUSDT
- `faucet()` - Claim 1,000 tokens
- `balanceOf(address)` - Check balance
- `approve(address, uint256)` - Approve spending
- `decimals()` - Returns 6

### EstToken
- `faucet()` - Claim 1,000 tokens
- `balanceOf(address)` - Check balance
- `approve(address, uint256)` - Approve spending
- `burn(uint256)` - Burn tokens
- `decimals()` - Returns 18

### YieldVault
- `deposit(uint256, address)` - Deposit tokens
- `withdraw(uint256)` - Withdraw shares
- `stakeEst(uint256)` - Stake EST for boost
- `unstakeEst(uint256)` - Unstake EST
- `getUserAssets(address)` - Get user's total assets
- `getCurrentAPY(address)` - Get user's current APY
- `BASE_APY()` - Returns 1000 (10%)
- `BOOSTED_APY()` - Returns 1500 (15%)

### EstStake
- `stake(uint256, uint256)` - Stake EST with lock period
- `unstake(uint256)` - Unstake after lock period
- `claimRewards(uint256)` - Claim accumulated rewards
- `pendingRewards(address, uint256)` - Check pending rewards
- `LOCK_30_DAYS()` - 30 days in seconds
- `LOCK_90_DAYS()` - 90 days in seconds
- `LOCK_180_DAYS()` - 180 days in seconds

## Explorer Links

After deployment, share these links with beta testers:

- **MockUSDC:** https://sepolia.basescan.org/address/0xYourMockUSDCAddress
- **MockUSDT:** https://sepolia.basescan.org/address/0xYourMockUSDTAddress
- **EstToken:** https://sepolia.basescan.org/address/0xYourEstTokenAddress
- **YieldVault:** https://sepolia.basescan.org/address/0xYourYieldVaultAddress
- **EstStake:** https://sepolia.basescan.org/address/0xYourEstStakeAddress

## Next Steps

After successful deployment:

1. Test all faucet functionality
2. Invite beta testers
3. Monitor contract interactions on BaseScan
4. Gather feedback through Discord/Twitter
5. Track issues and bugs
6. Prepare for mainnet deployment

## Support

- **Documentation:** See `BETA_FAUCET_SETUP.md`
- **Discord:** discord.gg/estable
- **Twitter:** @StablecoinDeFiLATAM

---

**Network:** Base Sepolia (Chain ID: 84532)
**RPC:** https://sepolia.base.org
**Explorer:** https://sepolia.basescan.org
**Last Updated:** November 6, 2025
