# Beta Faucet Setup Guide

This guide explains how to set up and use the test token faucet system for Estable Beta testing.

## Overview

The Beta page now includes an integrated faucet system that allows beta testers to:
- Claim test tokens (mUSDC, mUSDT, EST) with a 24-hour cooldown
- Access Base Sepolia gas faucets for transaction fees
- Run a quick demo flow to test the complete yield optimization system

## Components

### 1. TokenFaucet Component
**File:** `/src/components/TokenFaucet.tsx`

**Features:**
- One-click claiming of 1,000 mUSDC, 1,000 mUSDT, and 1,000 EST tokens
- 24-hour cooldown enforced via localStorage
- Automatic token approval for YieldVault and EstStake contracts
- Real-time countdown timer showing time until next claim
- Success/error notifications via Sonner toasts

**Rate Limiting:**
- Uses localStorage key: `faucet_claim_${address}`
- Stores timestamp of last claim
- 24-hour (86,400,000 ms) cooldown period
- Countdown displayed in hours, minutes, seconds

### 2. GasFaucet Component
**File:** `/src/components/GasFaucet.tsx`

**Features:**
- Links to multiple Base Sepolia ETH faucets
- Includes official Base faucet, Circle faucet, PoW faucet, and Alchemy faucet
- Quick guide for obtaining test ETH
- Gas cost information and estimates

**Included Faucets:**
- **Base Sepolia Faucet** - https://www.base.org/faucets
- **Circle USDC Faucet** - https://faucet.circle.com
- **Sepolia PoW Faucet** - https://sepolia-faucet.pk910.de
- **Alchemy Faucet** - https://sepoliafaucet.com

### 3. DemoFlow Component
**File:** `/src/components/DemoFlow.tsx`

**Features:**
- 4-step guided demo of the yield optimization system
- Progress tracking with visual indicators
- Interactive inputs for deposit and stake amounts
- Simulated time passage to demonstrate yield accrual
- Reset functionality to run demo multiple times

**Demo Steps:**
1. **Deposit mUSDC** - Deposit 100 mUSDC into YieldVault
2. **Stake EST** - Stake 1,000 EST to boost APY
3. **Simulate Time** - Fast-forward to show yield accrual
4. **Check Boosted APY** - Display final APY with boost (15%)

## Contract Integration

### Required Contract Addresses

Update these environment variables in `.env` after deploying contracts:

```env
# Base Sepolia Beta Testing (Chain ID: 84532)
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Beta Test Contract Addresses
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_EST_TOKEN_ADDRESS=0x...
VITE_YIELD_VAULT_ADDRESS=0x...
VITE_EST_STAKE_ADDRESS=0x...
```

### Deployment Steps

1. **Compile Contracts:**
   ```bash
   cd contracts
   npx hardhat compile
   ```

2. **Deploy to Base Sepolia:**
   ```bash
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```

3. **Update Environment Variables:**
   - Copy addresses from `contracts/deployments.json`
   - Paste into `.env` file
   - Restart development server

4. **Verify Contracts (Optional):**
   ```bash
   npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
   ```

### Contract ABIs

The components use minimal ABIs for required functions:

**ERC20 ABI:**
```javascript
[
  'function faucet() external',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]
```

**YieldVault ABI:**
```javascript
[
  'function deposit(uint256 amount, address token) external',
  'function getUserAssets(address user) view returns (uint256)',
  'function getCurrentAPY(address user) view returns (uint256)',
  'function stakeEst(uint256 amount) external',
  'function estStaked(address user) view returns (uint256)',
]
```

## Token Amounts

### Faucet Distribution
- **mUSDC:** 1,000 tokens (6 decimals)
- **mUSDT:** 1,000 tokens (6 decimals)
- **EST:** 1,000 tokens (18 decimals)

These amounts are defined in the smart contracts' `faucet()` functions.

### Auto-Approval
After claiming, tokens are automatically approved for:
- **YieldVault:** Maximum uint256 for mUSDC and mUSDT
- **EstStake:** Maximum uint256 for EST

This eliminates the need for separate approval transactions during testing.

## Security Considerations

### Rate Limiting
- **Method:** localStorage-based per-address cooldown
- **Limitation:** Can be bypassed by clearing browser storage
- **Mitigation:** For production, implement on-chain or backend rate limiting

### Gas Fees
- Users need Base Sepolia ETH for gas
- Estimated gas costs:
  - Claim tokens: ~150,000 gas (~$0.0015)
  - Approve tokens: ~50,000 gas per approval (~$0.0005)
  - Deposit: ~100,000 gas (~$0.001)
  - Total for full flow: ~$0.003

### Error Handling
All operations include comprehensive error handling:
- Network errors
- Insufficient gas
- Contract reverts
- User rejection
- Missing contract addresses

## User Flow

### First-Time User
1. Visit `/beta` page
2. Connect wallet (MetaMask/Rabby)
3. Auto-switch to Base Sepolia network
4. Navigate to "Gas Faucets" tab
5. Get test ETH from any faucet
6. Return to "Test Tokens" tab
7. Click "Claim Test Tokens"
8. Wait for transaction confirmations
9. Tokens are automatically approved
10. Ready to test!

### Returning User (After 24 Hours)
1. Visit `/beta` page
2. Connect wallet
3. Navigate to "Test Tokens" tab
4. Click "Claim Test Tokens" again
5. Continue testing

### Demo Flow
1. Navigate to "Quick Demo" tab
2. Follow 4-step guided process
3. See APY boost in action
4. Reset and try again with different amounts

## Testing Checklist

Before releasing to beta testers:

- [ ] Deploy all contracts to Base Sepolia
- [ ] Update `.env` with contract addresses
- [ ] Test token claiming with fresh wallet
- [ ] Verify 24-hour cooldown works
- [ ] Test auto-approval after claiming
- [ ] Verify gas faucet links work
- [ ] Test demo flow end-to-end
- [ ] Check mobile responsiveness
- [ ] Verify error messages display correctly
- [ ] Test with multiple wallets (MetaMask, Rabby)
- [ ] Verify contract verification on BaseScan
- [ ] Test network switching functionality

## Troubleshooting

### "Contract addresses not configured"
**Solution:** Deploy contracts and update `.env` with addresses

### "Please wait X hours before claiming again"
**Solution:** Wait for cooldown period or clear localStorage (testing only)

### "Insufficient funds for gas"
**Solution:** Visit gas faucets to get Base Sepolia ETH

### "User rejected transaction"
**Solution:** User canceled in wallet - normal behavior

### "Network error"
**Solution:** Check internet connection and RPC endpoint

## Monitoring

Track beta tester activity using:
1. **BaseScan:** Monitor contract interactions
2. **Console Logs:** Debug information in browser console
3. **Supabase:** Optional storage for faucet claim data
4. **LocalStorage:** Check `faucet_claim_*` keys

## Future Enhancements

Potential improvements for production:
- On-chain rate limiting via smart contract
- Backend API for claim verification
- Captcha for bot prevention
- IP-based rate limiting
- Referral system for additional claims
- Achievement badges for testing milestones
- Leaderboard for active testers

## Support

For issues or questions:
- **Discord:** discord.gg/estable
- **Twitter:** @StablecoinDeFiLATAM
- **Email:** support@estable.app

## Resources

- **Base Sepolia Explorer:** https://sepolia.basescan.org
- **Base Sepolia RPC:** https://sepolia.base.org
- **Base Documentation:** https://docs.base.org
- **Hardhat Documentation:** https://hardhat.org/docs
- **Ethers.js Documentation:** https://docs.ethers.org/v6

---

**Last Updated:** November 6, 2025
**Version:** 1.0.0
**Network:** Base Sepolia (Chain ID: 84532)
