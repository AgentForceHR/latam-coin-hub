# Estable Smart Contracts Guide

## Complete Contract Suite

Comprehensive smart contracts for Estable yield optimization protocol with share-based vaults, time-locked staking, and automated testing.

## Contracts Overview

### MockUSDC & MockUSDT
- 6 decimals (matches real stablecoins)
- 1 trillion initial supply
- Public faucet: 10,000 tokens per call
- Owner mint capability

### EstToken  
- 18 decimals
- 1 billion initial supply
- Burnable for deflation simulation
- Public faucet: 1,000 EST per call

### YieldVault (Share-Based)
- ERC-20 vault shares
- 10% base APY, 15% boosted APY
- EST staking threshold: 1,000 EST
- Multi-asset support (mUSDC, mUSDT)
- Mock Morpho integration (8-12% rates)

### EstStake (Time-Locked)
- Lock periods: 30/90/180 days
- Boost multipliers: 1.2x/1.5x/2.0x
- Rewards accrual
- Emergency unstake (20% penalty)

## Quick Start

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Testing

All tests use Hardhat's time manipulation for yield simulation:
- MockTokens.test.ts - Token functionality
- YieldVault.test.ts - Deposits, yields, withdrawals
- EstStake.test.ts - Staking, rewards, unstaking

Run tests: `npx hardhat test`

## Deployment Cost

~0.010 ETH on Base Sepolia for all 5 contracts

## Verification

```bash
npx hardhat verify --network baseSepolia <ADDRESS>
```

Full documentation in contracts/README.md
