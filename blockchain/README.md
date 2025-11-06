# LATAM DeFi Smart Contracts

Smart contracts for the LATAM DeFi platform on Binance Smart Chain.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your MetaMask private key
- BSCScan API key (optional, for verification)

**⚠️ SECURITY WARNING:**
- Never commit `.env` to GitHub
- Keep your private key secret
- Use a test wallet for testnet

### 3. Get Test BNB

1. Go to: https://testnet.bnbchain.org/faucet-smart
2. Enter your wallet address
3. Request test BNB
4. Wait 1-2 minutes

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Deploy to BSC Testnet

```bash
npm run deploy:testnet
```

This will:
- Deploy LATAM token
- Deploy 3 stablecoins (USD, BRL, ARS)
- Deploy staking contract
- Save addresses to `deployments.json`

### 6. Verify on BSCScan (Optional)

```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

## Contracts

### EstableToken.sol
- ERC20 governance token
- 1 billion max supply
- 100 million initial supply
- Burnable
- Mintable by owner

### Stablecoin.sol
- Collateralized stablecoins
- 150% collateral ratio required
- Supports USD, BRL, ARS pegs
- Redeemable for BNB collateral

### Staking.sol
- Stake EST tokens
- Lock periods: 3-12 months
- Voting power (ve-power)
- APY rewards: 5-15%
- Early unstake penalty: 10%

## Contract Addresses

After deployment, addresses are saved in `deployments.json`:

```json
{
  "estableToken": "0x...",
  "usdStablecoin": "0x...",
  "brlStablecoin": "0x...",
  "arsStablecoin": "0x...",
  "staking": "0x..."
}
```

## Testing

Run tests:

```bash
npm test
```

## Security

- OpenZeppelin contracts used for security
- ReentrancyGuard on critical functions
- Ownable for admin functions
- Emergency withdraw functions

## Networks

### BSC Testnet
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.bnbchain.org:8545
- Explorer: https://testnet.bscscan.com

### BSC Mainnet (NOT IMPLEMENTED YET)
- Chain ID: 56
- RPC: https://bsc-dataseed1.bnbchain.org
- Explorer: https://bscscan.com

## Gas Costs (Estimated)

On BSC Testnet:
- Estable Token: ~0.005 BNB
- Stablecoin: ~0.004 BNB each
- Staking: ~0.006 BNB
- **Total**: ~0.023 BNB (~$5-10 on mainnet)

## Troubleshooting

### Error: Insufficient funds
**Solution:** Get more test BNB from faucet

### Error: Nonce too high
**Solution:** Reset MetaMask account

### Error: Gas estimation failed
**Solution:** Check contract code for errors

## License

MIT
