# Estable Beta Testing dApp

Full-stack yield optimization protocol beta testing environment on Base Sepolia testnet.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Compile smart contracts
npm run hardhat:compile

# Start development server
npm run dev
```

Visit `http://localhost:5173/beta/test` to access the beta testing interface.

## 🌐 Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 📦 Project Structure

```
estable/
├── src/                          # Frontend React application
│   ├── components/              # UI components (shadcn-ui)
│   ├── contexts/                # React contexts
│   │   ├── LanguageContext.tsx # Multi-language support
│   │   └── Web3Context.tsx     # Wallet & blockchain state
│   ├── lib/                     # Utilities
│   │   ├── web3.ts             # Web3 integration (ethers.js)
│   │   └── translations.ts     # i18n translations
│   └── pages/                   # Route pages
│       ├── BetaTest.tsx        # Main beta testing interface
│       └── ...
├── contracts/                    # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── MockUSDC.sol        # Mock USDC (6 decimals)
│   │   ├── MockUSDT.sol        # Mock USDT (6 decimals)
│   │   ├── EstableToken.sol    # EST governance token (18 decimals)
│   │   └── EstableVault.sol    # Yield vault with EST staking boost
│   ├── scripts/
│   │   └── deploy.ts           # Deployment script
│   ├── hardhat.config.ts       # Hardhat configuration
│   └── package.json
├── .env                         # Environment variables (create from .env.example)
└── package.json
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill in the required values:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Base Sepolia
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org

# For contract deployment
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

### 2. Get Test ETH

You need Base Sepolia ETH to deploy contracts and interact with the dApp:

1. Visit [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Enter your wallet address
3. Claim test ETH (you'll receive ~0.05 ETH)

### 3. Deploy Smart Contracts

```bash
# Compile contracts
npm run hardhat:compile

# Deploy to Base Sepolia
npm run hardhat:deploy
```

After deployment, contract addresses will be saved to `contracts/deployments.json`.

### 4. Update Environment Variables

Copy the deployed contract addresses from `contracts/deployments.json` to your `.env` file:

```env
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_EST_TOKEN_ADDRESS=0x...
VITE_USDC_VAULT_ADDRESS=0x...
VITE_USDT_VAULT_ADDRESS=0x...
```

### 5. Start the dApp

```bash
npm run dev
```

Navigate to `http://localhost:5173/beta/test`

## 🎮 Beta Testing Features

### 1. Wallet Connection
- **Supported Wallets**: MetaMask, Rabby
- **Auto-Switch**: Automatically prompts to switch/add Base Sepolia network
- **Network Detection**: Shows warning if on wrong network

### 2. Test Token Faucets
Get free test tokens directly from the UI:
- **USDC**: 1,000 USDC per faucet claim (6 decimals)
- **USDT**: 1,000 USDT per faucet claim (6 decimals)
- **EST**: 100 EST per faucet claim (18 decimals)

### 3. Yield Optimization
- **Deposit**: Deposit USDC/USDT into yield vaults
- **Base APY**: 10% annual yield
- **Withdraw**: Withdraw principal + earned yield anytime
- **Claim**: Claim accrued yield without withdrawing principal

### 4. EST Token Staking Boost
- **Boost APY**: Stake EST to increase yield up to +5%
- **Max Boost**: Stake EST equal to 50% of deposit for maximum boost
- **Linear Scaling**: Boost increases proportionally with EST staked
- **Example**:
  - Deposit: 1,000 USDC
  - Stake: 500 EST (50% of deposit)
  - APY: 10% base + 5% boost = **15% total APY**

### 5. Referral System
- **Share Code**: Your unique referral code (based on wallet address)
- **Apply Code**: Enter referral codes from other users
- **Tracking**: Referral data stored in localStorage (for beta testing)

### 6. Mock Governance
- **View Proposals**: See active governance proposals
- **Vote**: Vote for/against proposals (mock interface)
- **Integration**: Demonstrates Snapshot-style governance UI

### 7. Feedback & Bug Reporting
- **Feedback Form**: Submit general feedback (Google Forms)
- **Bug Reports**: Report bugs via Discord
- **User Testing**: Help improve the platform!

## 📊 Smart Contract Details

### MockUSDC & MockUSDT
- **Type**: ERC-20 stablecoin tokens
- **Decimals**: 6
- **Faucet**: Public `faucet()` function gives 1,000 tokens
- **Mint**: Owner can mint unlimited tokens

### EstableToken (EST)
- **Type**: ERC-20 governance token
- **Decimals**: 18
- **Total Supply**: 1 billion EST max
- **Initial Supply**: 100 million EST
- **Faucet**: Public `faucet()` function gives 100 EST

### EstableVault
- **Deposit Token**: USDC or USDT
- **Boost Token**: EST
- **Base APY**: 10% (1000 basis points)
- **Max Boost**: +5% (500 basis points)
- **Yield Calculation**: Compounded continuously based on timestamp
- **Features**:
  - Deposit stablecoins
  - Withdraw principal + yield
  - Claim yield separately
  - Stake EST for APY boost
  - Unstake EST anytime

**APY Formula**:
```
Current APY = Base APY + (Max Boost * (EST Staked / Deposit Amount) / 0.5)
Max boost achieved when: EST Staked = 50% of Deposit Amount
```

## 🔐 Security Notes

### ⚠️ TESTNET ONLY
- All tokens have **NO REAL VALUE**
- This is a **TESTING ENVIRONMENT**
- Never use mainnet private keys
- Test thoroughly before mainnet deployment

### Private Key Safety
- Never commit `.env` file to git
- Use a separate wallet for testing
- Keep your private keys secure
- The `.env` file is already in `.gitignore`

## 🛠️ Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code

# Smart Contracts
npm run hardhat:compile  # Compile contracts
npm run hardhat:deploy   # Deploy to Base Sepolia
npm run hardhat:test     # Run contract tests

# Combined workflow
npm install              # Install all dependencies
npm run hardhat:compile  # Compile contracts
npm run dev             # Start development
```

## 📝 Testing Workflow

1. **Connect Wallet**
   - Install MetaMask or Rabby
   - Connect to Base Sepolia (auto-prompted)
   - Ensure you have test ETH

2. **Get Test Tokens**
   - Click "Get Test USDC" button
   - Click "Get Test USDT" button
   - Click "Get Test EST" button
   - Wait for transactions to confirm

3. **Test Deposits**
   - Navigate to "Deposit" tab
   - Enter amount (e.g., 100 USDC)
   - Click "Deposit USDC"
   - Approve + Deposit (2 transactions)
   - Verify balance updates

4. **Test EST Staking**
   - Navigate to "Stake EST" tab
   - Enter EST amount (e.g., 50 EST for 100 USDC deposit)
   - Click "Stake EST"
   - Verify APY boost increases

5. **Test Yield Accrual**
   - Wait a few minutes
   - Check "Pending Yield" updates in real-time
   - Click "Claim Yield" to harvest

6. **Test Withdrawal**
   - Navigate to "Withdraw" tab
   - Enter withdrawal amount
   - Click "Withdraw"
   - Verify principal + yield received

7. **Test Referrals**
   - Copy your referral code
   - Share with others (or use in another browser)
   - Apply referral code
   - Verify localStorage storage

8. **Submit Feedback**
   - Click "Submit Feedback"
   - Fill out the form
   - Click "Report Bug" for issues

## 🌟 Key Features Demonstrated

### Frontend
- ✅ React + TypeScript + Vite
- ✅ shadcn-ui component library
- ✅ Tailwind CSS styling
- ✅ Ethers.js v6 integration
- ✅ MetaMask/Rabby wallet support
- ✅ Auto network switching
- ✅ Real-time balance updates
- ✅ Transaction notifications (toast)
- ✅ Loading states (skeletons)
- ✅ Responsive design
- ✅ Multi-language support (EN/ES/PT)

### Smart Contracts
- ✅ Hardhat development environment
- ✅ TypeScript deployment scripts
- ✅ OpenZeppelin contracts
- ✅ ERC-20 tokens with faucets
- ✅ Yield vault with time-based accrual
- ✅ EST staking boost mechanism
- ✅ ReentrancyGuard protection
- ✅ SafeERC20 usage

### Beta Testing
- ✅ Testnet disclaimers
- ✅ Network validation
- ✅ Test token faucets
- ✅ Yield optimization
- ✅ Staking for boosts
- ✅ Referral tracking
- ✅ Mock governance
- ✅ Feedback collection

## 🔗 Useful Links

- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **MetaMask**: https://metamask.io
- **Rabby Wallet**: https://rabby.io
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org/v6/

## 🐛 Troubleshooting

### "Please install MetaMask"
- Install MetaMask or Rabby wallet extension
- Refresh the page after installation

### "Failed to switch network"
- Manually add Base Sepolia in wallet:
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency: ETH
  - Explorer: https://sepolia.basescan.org

### "Insufficient funds"
- Get test ETH from Base faucet
- Use test token faucets in the dApp

### "Transaction failed"
- Check you have enough ETH for gas
- Ensure you're on Base Sepolia network
- Try increasing gas limit

### Contracts not deployed
- Run `npm run hardhat:compile`
- Run `npm run hardhat:deploy`
- Copy addresses to `.env`

### Balance not updating
- Wait for transaction confirmation
- Refresh the page
- Check transaction on block explorer

## 📄 License

MIT

## 🤝 Contributing

This is a beta testing environment. Please report bugs and feedback through the dApp interface!

---

**⚠️ TESTNET ONLY - NO REAL VALUE**

Built with ❤️ for the Estable community
