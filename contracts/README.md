# Estable Beta Smart Contracts

Smart contracts for the Estable beta testing environment on Base Sepolia testnet.

## Contracts

### MockUSDC.sol
Mock USDC stablecoin for testing purposes.
- **Decimals**: 6
- **Initial Supply**: 1,000,000 USDC (to deployer)
- **Faucet**: Public function giving 1,000 USDC per call
- **Mintable**: Owner can mint unlimited tokens

### MockUSDT.sol
Mock USDT stablecoin for testing purposes.
- **Decimals**: 6
- **Initial Supply**: 1,000,000 USDT (to deployer)
- **Faucet**: Public function giving 1,000 USDT per call
- **Mintable**: Owner can mint unlimited tokens

### EstableToken.sol
EST governance token.
- **Decimals**: 18
- **Max Supply**: 1,000,000,000 EST
- **Initial Supply**: 100,000,000 EST (to deployer)
- **Faucet**: Public function giving 100 EST per call
- **Mintable**: Owner can mint up to max supply

### EstableVault.sol
Yield-generating vault with EST staking boost.
- **Deposit Token**: USDC or USDT
- **Boost Token**: EST
- **Base APY**: 10%
- **Max Boost**: +5%
- **Yield**: Compounded continuously based on timestamp

#### Key Features
- Deposit stablecoins
- Withdraw principal + yield
- Claim yield without withdrawing
- Stake EST for APY boost
- Unstake EST anytime

#### APY Calculation
```
Base APY: 10% (1000 basis points)
Max Boost: +5% (500 basis points)

Boost Formula:
boost_percentage = (EST_staked / deposit_amount) × 100
if boost_percentage > 50: boost_percentage = 50

boost = (MAX_BOOST × boost_percentage) / 50
current_apy = BASE_APY + boost

Example:
Deposit: 1000 USDC
Stake: 500 EST (50% of deposit)
Boost: (500 / 1000) × 100 = 50%
APY: 10% + 5% = 15%
```

#### Yield Accrual
Yields accrue continuously based on elapsed time:
```solidity
yield = (amount × apy × time_elapsed) / (10000 × SECONDS_PER_YEAR)
```

## Setup

### Install Dependencies
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

## Deployment

### Prerequisites
1. Get Base Sepolia ETH from faucet
2. Create `.env` file in project root:
```env
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Deployment Output
Contract addresses will be saved to `deployments.json`:
```json
{
  "mockUSDC": "0x...",
  "mockUSDT": "0x...",
  "estableToken": "0x...",
  "usdcVault": "0x...",
  "usdtVault": "0x..."
}
```

## Verify Contracts (Optional)

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Contract Addresses

After deployment, update your main `.env` file:
```env
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_EST_TOKEN_ADDRESS=0x...
VITE_USDC_VAULT_ADDRESS=0x...
VITE_USDT_VAULT_ADDRESS=0x...
```

## Network Configuration

```javascript
{
  chainId: 84532,
  name: "Base Sepolia",
  rpc: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org"
}
```

## Gas Estimates

Approximate gas costs on Base Sepolia:
- Deploy MockUSDC: ~900,000 gas
- Deploy MockUSDT: ~900,000 gas
- Deploy EstableToken: ~1,200,000 gas
- Deploy EstableVault: ~2,000,000 gas
- Total: ~5,000,000 gas

With Base Sepolia gas prices (~0.001 gwei), deployment costs ~0.005 ETH total.

## Security

### Implemented
- ✅ ReentrancyGuard on all state-changing functions
- ✅ SafeERC20 for token transfers
- ✅ Ownable pattern for admin functions
- ✅ Max supply cap on EST token
- ✅ Input validation

### Testnet Only
⚠️ These contracts are for TESTNET ONLY
⚠️ DO NOT use on mainnet without full security audit
⚠️ All tokens have NO REAL VALUE

## Contract Interactions

### Get Test Tokens
```solidity
// Get 1000 USDC
mockUSDC.faucet()

// Get 1000 USDT
mockUSDT.faucet()

// Get 100 EST
estableToken.faucet()
```

### Deposit to Vault
```solidity
// 1. Approve vault to spend USDC
mockUSDC.approve(vaultAddress, amount)

// 2. Deposit to vault
vault.deposit(amount)
```

### Stake EST for Boost
```solidity
// 1. Approve vault to spend EST
estableToken.approve(vaultAddress, amount)

// 2. Stake EST
vault.stakeEst(amount)
```

### Withdraw from Vault
```solidity
// Withdraw principal + yield
vault.withdraw(amount)
```

### Claim Yield
```solidity
// Claim yield without withdrawing principal
vault.claimYield()
```

### Check User Info
```solidity
(
  uint256 depositAmount,
  uint256 pendingYield,
  uint256 estStaked,
  uint256 currentAPY
) = vault.getUserInfo(userAddress)
```

## Development

### Project Structure
```
contracts/
├── contracts/          # Solidity contracts
├── scripts/           # Deployment scripts
├── test/              # Contract tests
├── artifacts/         # Compiled contracts (generated)
├── cache/             # Hardhat cache (generated)
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

### Adding Tests
Create test files in `test/` directory:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EstableVault", function () {
  it("Should deposit correctly", async function () {
    // Test implementation
  });
});
```

Run tests:
```bash
npx hardhat test
```

## Troubleshooting

### Compilation Errors
```bash
# Clear cache and recompile
npx hardhat clean
npx hardhat compile
```

### Deployment Fails
- Check you have enough ETH for gas
- Verify RPC URL is correct
- Ensure private key is valid
- Check network connectivity

### Contract Verification Fails
- Wait a few minutes after deployment
- Ensure BaseScan API key is correct
- Check contract was deployed successfully
- Verify you're using correct network

## Resources

- Hardhat: https://hardhat.org/docs
- OpenZeppelin: https://docs.openzeppelin.com/contracts
- Base Sepolia: https://docs.base.org/network-information
- Block Explorer: https://sepolia.basescan.org

## License

MIT
