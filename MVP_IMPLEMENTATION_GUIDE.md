# LATAM DeFi MVP Implementation Guide
## From Mock Backend to Real BSC Testnet Integration

This guide will walk you through converting your fullstack DeFi app into a working MVP on Binance Smart Chain (BSC) testnet with a real LATAM token.

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Smart Contract Development](#phase-1-smart-contract-development)
4. [Phase 2: Deploy to BSC Testnet](#phase-2-deploy-to-bsc-testnet)
5. [Phase 3: Frontend Integration](#phase-3-frontend-integration)
6. [Phase 4: Backend Integration](#phase-4-backend-integration)
7. [Phase 5: Testing & Launch](#phase-5-testing--launch)

---

## Overview

**What We'll Build:**
- LATAM ERC20 token on BSC testnet
- Stablecoin minting contract (USD, BRL, ARS pegs)
- Real wallet connection (MetaMask)
- Web3 integration in frontend
- Smart contract interaction in backend
- Full end-to-end testing

**Timeline:** 2-3 days for a skilled developer

---

## Prerequisites

### Tools You Need to Install

1. **MetaMask Browser Extension**
   - Download: https://metamask.io/download/
   - Install in Chrome/Firefox/Brave

2. **Node.js & npm** (Already installed)
   - Verify: `node --version` (should be 18+)

3. **Hardhat** (Smart contract development)
   ```bash
   npm install --global hardhat
   ```

4. **BSC Testnet BNB** (Free test tokens)
   - Get from: https://testnet.bnbchain.org/faucet-smart

### Accounts You Need

1. **MetaMask Wallet**
   - Create new wallet
   - Save seed phrase securely (NEVER share this!)
   - Get your wallet address (starts with 0x...)

2. **BSC Testnet Setup in MetaMask**
   - Network Name: `BSC Testnet`
   - RPC URL: `https://data-seed-prebsc-1-s1.bnbchain.org:8545`
   - Chain ID: `97`
   - Symbol: `BNB`
   - Block Explorer: `https://testnet.bscscan.com`

---

## Phase 1: Smart Contract Development

### Step 1.1: Create Smart Contracts Folder

```bash
cd /path/to/your/project
mkdir contracts
cd contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Choose: "Create a JavaScript project"

### Step 1.2: Write LATAM Token Contract

Create `contracts/LATAMToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LATAMToken is ERC20, Ownable {
    constructor() ERC20("LATAM DeFi Token", "LATAM") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10 ** decimals()); // 1 billion tokens
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Step 1.3: Write Stablecoin Contract

Create `contracts/Stablecoin.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Stablecoin is ERC20, Ownable {
    uint256 public collateralRatio = 150; // 150% minimum collateral
    uint256 public pegRate; // Rate in wei (e.g., 1 for USD, 5.5 for BRL, 950 for ARS)

    mapping(address => uint256) public collateralBalances;

    event Minted(address indexed user, uint256 amount, uint256 collateral);
    event Redeemed(address indexed user, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _pegRate
    ) ERC20(name, symbol) Ownable(msg.sender) {
        pegRate = _pegRate;
    }

    function mint(uint256 amount) public payable {
        uint256 requiredCollateral = (amount * pegRate * collateralRatio) / 100;
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        collateralBalances[msg.sender] += msg.value;
        _mint(msg.sender, amount);

        emit Minted(msg.sender, amount, msg.value);
    }

    function redeem(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 collateralToReturn = (amount * pegRate * collateralRatio) / 100;
        require(collateralBalances[msg.sender] >= collateralToReturn, "Insufficient collateral");

        collateralBalances[msg.sender] -= collateralToReturn;
        _burn(msg.sender, amount);

        payable(msg.sender).transfer(collateralToReturn);

        emit Redeemed(msg.sender, amount);
    }

    function getCollateralBalance(address user) public view returns (uint256) {
        return collateralBalances[user];
    }
}
```

### Step 1.4: Write Staking Contract

Create `contracts/Staking.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    IERC20 public latamToken;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockMonths;
        uint256 vePower;
    }

    mapping(address => Stake[]) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 lockMonths);
    event Unstaked(address indexed user, uint256 stakeId, uint256 amount);

    constructor(address _latamToken) Ownable(msg.sender) {
        latamToken = IERC20(_latamToken);
    }

    function stake(uint256 amount, uint256 lockMonths) public {
        require(lockMonths >= 3 && lockMonths <= 12, "Lock period must be 3-12 months");
        require(latamToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 vePower = amount * (100 + (lockMonths * 8)) / 100;

        stakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            lockMonths: lockMonths,
            vePower: vePower
        }));

        emit Staked(msg.sender, amount, lockMonths);
    }

    function unstake(uint256 stakeId) public {
        require(stakeId < stakes[msg.sender].length, "Invalid stake ID");
        Stake memory userStake = stakes[msg.sender][stakeId];

        uint256 lockEndTime = userStake.startTime + (userStake.lockMonths * 30 days);
        uint256 amountToReturn = userStake.amount;

        if (block.timestamp < lockEndTime) {
            // Early unstake: 10% penalty
            amountToReturn = (amountToReturn * 90) / 100;
        }

        // Remove stake
        stakes[msg.sender][stakeId] = stakes[msg.sender][stakes[msg.sender].length - 1];
        stakes[msg.sender].pop();

        require(latamToken.transfer(msg.sender, amountToReturn), "Transfer failed");

        emit Unstaked(msg.sender, stakeId, amountToReturn);
    }

    function getStakes(address user) public view returns (Stake[] memory) {
        return stakes[user];
    }

    function getTotalVePower(address user) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < stakes[user].length; i++) {
            total += stakes[user][i].vePower;
        }
        return total;
    }
}
```

### Step 1.5: Install OpenZeppelin

```bash
npm install @openzeppelin/contracts
```

### Step 1.6: Configure Hardhat

Edit `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = "YOUR_METAMASK_PRIVATE_KEY"; // Get from MetaMask

module.exports = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      chainId: 97,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

**⚠️ SECURITY WARNING:**
- Never commit your private key to GitHub!
- Use `.env` file in production
- Keep your seed phrase secret

### Step 1.7: Write Deployment Script

Create `scripts/deploy.js`:

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy LATAM Token
  const LATAMToken = await ethers.getContractFactory("LATAMToken");
  const latamToken = await LATAMToken.deploy();
  await latamToken.waitForDeployment();
  console.log("LATAM Token deployed to:", await latamToken.getAddress());

  // Deploy Stablecoins
  const Stablecoin = await ethers.getContractFactory("Stablecoin");

  const usdStablecoin = await Stablecoin.deploy("LATAM USD", "LUSD", 1);
  await usdStablecoin.waitForDeployment();
  console.log("USD Stablecoin deployed to:", await usdStablecoin.getAddress());

  const brlStablecoin = await Stablecoin.deploy("LATAM BRL", "LBRL", 5);
  await brlStablecoin.waitForDeployment();
  console.log("BRL Stablecoin deployed to:", await brlStablecoin.getAddress());

  const arsStablecoin = await Stablecoin.deploy("LATAM ARS", "LARS", 950);
  await arsStablecoin.waitForDeployment();
  console.log("ARS Stablecoin deployed to:", await arsStablecoin.getAddress());

  // Deploy Staking
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await latamToken.getAddress());
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());

  // Save addresses to file
  const addresses = {
    latamToken: await latamToken.getAddress(),
    usdStablecoin: await usdStablecoin.getAddress(),
    brlStablecoin: await brlStablecoin.getAddress(),
    arsStablecoin: await arsStablecoin.getAddress(),
    staking: await staking.getAddress()
  };

  console.log("\nContract Addresses:", addresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Phase 2: Deploy to BSC Testnet

### Step 2.1: Get Test BNB

1. Go to: https://testnet.bnbchain.org/faucet-smart
2. Enter your MetaMask wallet address
3. Click "Give me BNB"
4. Wait 1-2 minutes for tokens to arrive
5. Check balance in MetaMask (switch to BSC Testnet)

### Step 2.2: Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

**Expected Output:**
```
Deploying contracts with: 0xYourAddress...
LATAM Token deployed to: 0x123...
USD Stablecoin deployed to: 0x456...
BRL Stablecoin deployed to: 0x789...
ARS Stablecoin deployed to: 0xabc...
Staking deployed to: 0xdef...
```

**Save these addresses! You'll need them for frontend/backend integration.**

### Step 2.3: Verify Contracts on BSCScan (Optional)

```bash
npx hardhat verify --network bscTestnet DEPLOYED_CONTRACT_ADDRESS
```

---

## Phase 3: Frontend Integration

### Step 3.1: Install Web3 Dependencies

```bash
cd /path/to/frontend
npm install ethers@6 wagmi viem @tanstack/react-query
```

### Step 3.2: Create Contract ABIs Folder

```bash
mkdir src/contracts
```

Copy ABIs from `contracts/artifacts/contracts/` to `src/contracts/`:
- LATAMToken.json
- Stablecoin.json
- Staking.json

### Step 3.3: Create Web3 Configuration

Create `src/config/web3.ts`:

```typescript
export const BSC_TESTNET_CONFIG = {
  chainId: 97,
  chainName: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  blockExplorer: 'https://testnet.bscscan.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  }
};

export const CONTRACT_ADDRESSES = {
  latamToken: '0xYOUR_LATAM_TOKEN_ADDRESS',
  usdStablecoin: '0xYOUR_USD_ADDRESS',
  brlStablecoin: '0xYOUR_BRL_ADDRESS',
  arsStablecoin: '0xYOUR_ARS_ADDRESS',
  staking: '0xYOUR_STAKING_ADDRESS'
};
```

### Step 3.4: Create Wallet Connection Component

Create `src/components/WalletConnect.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);

      setProvider(browserProvider);
      setAccount(accounts[0]);

      // Switch to BSC Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // 97 in hex
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BSC Testnet',
              rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              blockExplorerUrls: ['https://testnet.bscscan.com']
            }]
          });
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  return (
    <div>
      {!account ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <Button onClick={disconnectWallet} variant="outline">Disconnect</Button>
        </div>
      )}
    </div>
  );
}
```

### Step 3.5: Create Contract Interaction Hooks

Create `src/hooks/useContracts.ts`:

```typescript
import { useState, useEffect } from 'ethers';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/web3';
import LATAMTokenABI from '@/contracts/LATAMToken.json';
import StablecoinABI from '@/contracts/Stablecoin.json';
import StakingABI from '@/contracts/Staking.json';

export function useContracts(provider: ethers.BrowserProvider | null) {
  const [contracts, setContracts] = useState<any>(null);

  useEffect(() => {
    if (!provider) return;

    const setupContracts = async () => {
      const signer = await provider.getSigner();

      const latamToken = new ethers.Contract(
        CONTRACT_ADDRESSES.latamToken,
        LATAMTokenABI.abi,
        signer
      );

      const usdStablecoin = new ethers.Contract(
        CONTRACT_ADDRESSES.usdStablecoin,
        StablecoinABI.abi,
        signer
      );

      const staking = new ethers.Contract(
        CONTRACT_ADDRESSES.staking,
        StakingABI.abi,
        signer
      );

      setContracts({ latamToken, usdStablecoin, staking });
    };

    setupContracts();
  }, [provider]);

  return contracts;
}
```

### Step 3.6: Update Navbar with WalletConnect

Edit `src/components/Navbar.tsx` to include the WalletConnect button.

---

## Phase 4: Backend Integration

### Step 4.1: Install Web3 in Backend

```bash
cd /path/to/server
npm install ethers@6
```

### Step 4.2: Create Web3 Service

Create `server/src/services/web3.ts`:

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  'https://data-seed-prebsc-1-s1.bnbchain.org:8545'
);

const PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY!;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

export const web3Service = {
  provider,
  wallet,

  async getBalance(address: string) {
    return await provider.getBalance(address);
  },

  async getTokenBalance(tokenAddress: string, userAddress: string) {
    const contract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    return await contract.balanceOf(userAddress);
  }
};
```

### Step 4.3: Update Environment Variables

Add to `server/.env`:

```env
BACKEND_WALLET_PRIVATE_KEY=your_backend_wallet_private_key
BSC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
LATAM_TOKEN_ADDRESS=0x...
USD_STABLECOIN_ADDRESS=0x...
BRL_STABLECOIN_ADDRESS=0x...
ARS_STABLECOIN_ADDRESS=0x...
STAKING_CONTRACT_ADDRESS=0x...
```

### Step 4.4: Update Backend Routes

Modify routes to interact with smart contracts instead of mock data.

Example for mint endpoint in `server/src/routes/stablecoin.ts`:

```typescript
router.post('/mint', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, symbol, collateral_amount } = req.body;
    const userId = req.user!.id;

    // Get user's wallet address from database
    const { data: user } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    // Verify user has approved contract
    // Call smart contract to mint
    // Record transaction in database

    res.json({
      message: 'Minting transaction submitted',
      tx_hash: 'actual_tx_hash_from_blockchain'
    });
  } catch (error) {
    logger.error('Mint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Phase 5: Testing & Launch

### Step 5.1: Test Smart Contracts

```bash
cd contracts
npx hardhat test
```

### Step 5.2: Test Frontend

1. Start frontend: `npm run dev`
2. Connect MetaMask
3. Try each function:
   - Connect wallet
   - Mint stablecoin
   - Stake tokens
   - Vote on proposals

### Step 5.3: Test Backend Integration

1. Start backend: `npm run dev`
2. Test API endpoints with Postman
3. Verify database updates
4. Check transaction records

### Step 5.4: End-to-End Testing

Complete user flow:
1. Register account
2. Connect wallet
3. Get test BNB from faucet
4. Mint stablecoin
5. Deposit to vault
6. Stake tokens
7. Vote on proposal
8. Check balances

---

## Security Checklist

- [ ] Never commit private keys to Git
- [ ] Use `.env` files for sensitive data
- [ ] Add `.env` to `.gitignore`
- [ ] Test all contracts before mainnet
- [ ] Audit smart contracts (if going to mainnet)
- [ ] Use proper access controls (Ownable)
- [ ] Implement reentrancy guards where needed
- [ ] Test with small amounts first

---

## Common Issues & Solutions

### Issue: MetaMask not connecting
**Solution:** Make sure you're on BSC Testnet network

### Issue: Transaction fails
**Solution:** Check you have enough BNB for gas fees

### Issue: Contract deployment fails
**Solution:** Verify you have test BNB and private key is correct

### Issue: Frontend can't find contracts
**Solution:** Check contract addresses in `web3.ts` match deployed addresses

---

## Next Steps After MVP

1. **Add More Features:**
   - Governance voting contract
   - Vault/lending protocol
   - Liquidation mechanism

2. **Improve UI/UX:**
   - Transaction loading states
   - Error handling
   - Better wallet integration

3. **Security Audit:**
   - Professional contract audit
   - Penetration testing
   - Bug bounty program

4. **Mainnet Deployment:**
   - Test thoroughly on testnet first
   - Deploy to BSC mainnet
   - Monitor transactions

5. **Marketing:**
   - Documentation
   - Tutorial videos
   - Community building

---

## Cost Estimates

**Testnet (FREE):**
- Test BNB: Free from faucet
- Contract deployment: Free (using test BNB)
- Transactions: Free (using test BNB)

**Mainnet (REAL MONEY):**
- Contract deployment: ~$5-20 in BNB (depends on gas)
- Per transaction: ~$0.10-0.50
- Monthly hosting: $0-50 (if using serverless)

---

## Support & Resources

- **BSC Docs:** https://docs.bnbchain.org/
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin:** https://docs.openzeppelin.com/
- **Ethers.js:** https://docs.ethers.org/v6/
- **MetaMask:** https://docs.metamask.io/

---

## Conclusion

Following this guide, you'll have a working MVP with:
- Real blockchain integration
- Native LATAM token
- Stablecoin minting
- Staking functionality
- Full frontend + backend

Start with Phase 1, test thoroughly on testnet, and gradually add features. Good luck! 🚀
