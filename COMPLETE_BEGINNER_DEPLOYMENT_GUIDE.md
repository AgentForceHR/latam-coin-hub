# Complete Beginner's Guide to Deploy Stablecoin DeFi to Sepolia Testnet

**This guide assumes you've NEVER deployed a blockchain application before.**

Every step is explained in detail with exact instructions on what to click, what to type, and where to look.

---

## 📋 What You'll Do

1. Install required software on your computer
2. Set up a crypto wallet (MetaMask)
3. Get free test cryptocurrency
4. Deploy smart contracts to Sepolia blockchain
5. Connect your website to the contracts
6. Make everything work together

**Total Time**: 3-4 hours (first time)
**Cost**: $0 (completely free, using test networks)

---

## Part 1: Install Required Software

### Step 1.1: Install Node.js

**What is Node.js?** It's a program that lets you run JavaScript code on your computer (needed for development).

**Windows:**
1. Go to https://nodejs.org/ in your web browser
2. You'll see two green buttons. Click the **LEFT button** that says "LTS" (Long Term Support)
3. A file will download (named something like `node-v18.20.0-x64.msi`)
4. Find the downloaded file in your Downloads folder
5. Double-click it to run the installer
6. Click "Next" on every screen (keep all default settings)
7. Click "Install" when you reach that button
8. Wait for it to finish (takes 2-3 minutes)
9. Click "Finish"

**Mac:**
1. Go to https://nodejs.org/
2. Click the **LEFT button** labeled "LTS"
3. A file downloads (named like `node-v18.20.0.pkg`)
4. Find it in your Downloads folder
5. Double-click to open
6. Click "Continue" on every screen
7. Enter your Mac password when asked
8. Click "Install"
9. Wait 2-3 minutes
10. Click "Close"

**Verify it worked:**
- **Windows**: Press `Windows Key + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter

A black window opens (this is the Terminal/Command Prompt). Type this exactly:
```
node --version
```
Press Enter. You should see something like `v18.20.0`. If you do, success! ✅

### Step 1.2: Install Git

**What is Git?** A tool for managing code and tracking changes.

**Windows:**
1. Go to https://git-scm.com/
2. Click the big "Download for Windows" button
3. File downloads (named like `Git-2.43.0-64-bit.exe`)
4. Double-click the downloaded file
5. Click "Next" on EVERY screen (don't change any settings)
6. Click "Install"
7. Wait 1-2 minutes
8. Click "Finish"

**Mac:**
1. Open Terminal (press `Cmd + Space`, type `terminal`, press Enter)
2. Type this command:
```
git --version
```
3. If you see a version number, it's already installed! ✅
4. If not, a popup appears asking to install Developer Tools. Click "Install"
5. Wait 5-10 minutes for download and installation
6. Try `git --version` again

**Verify:**
In Terminal/Command Prompt, type:
```
git --version
```
You should see something like `git version 2.43.0` ✅

### Step 1.3: Install Visual Studio Code (VS Code)

**What is VS Code?** A text editor that makes it easy to edit code files.

**All Systems:**
1. Go to https://code.visualstudio.com/
2. Click the big blue "Download" button
3. It automatically detects your system (Windows/Mac/Linux)
4. File downloads
5. **Windows**: Double-click the `.exe` file, click "Next" on everything, click "Install"
6. **Mac**: Double-click the `.zip` file, drag VS Code icon to Applications folder
7. Open VS Code:
   - **Windows**: Search for "Visual Studio Code" in Start menu
   - **Mac**: Open Applications folder, click VS Code

### Step 1.4: Install MetaMask

**What is MetaMask?** A digital wallet (like a digital bank account) for cryptocurrency.

1. Open your web browser (Chrome, Firefox, Edge, or Brave)
2. Go to https://metamask.io/
3. Click the big "Download" button
4. Click "Install MetaMask for [Your Browser]"
5. Browser opens extension store page
6. Click "Add to Chrome" (or "Add to Firefox", etc.)
7. Click "Add Extension" in the popup
8. Wait for it to install (30 seconds)
9. MetaMask fox icon appears in your browser toolbar (top right)

---

## Part 2: Set Up MetaMask Wallet

### Step 2.1: Create a New Wallet

1. Click the MetaMask fox icon in your browser toolbar
2. Click "Get Started"
3. Click "Create a new wallet"
4. Click "I agree" (after reading the terms)
5. Create a PASSWORD:
   - Must be at least 8 characters
   - Make it strong but remember it!
   - Write it down somewhere safe
6. Click "Create a new wallet"

### Step 2.2: Save Your Secret Recovery Phrase (CRITICAL!)

**⚠️ THIS IS THE MOST IMPORTANT STEP ⚠️**

1. You'll see a blurred box with "Secret Recovery Phrase"
2. Click "Reveal Secret Recovery Phrase"
3. You'll see 12 words like: `apple banana cherry...`
4. **CRITICAL**: Write these 12 words on PAPER in ORDER
   - DO NOT take a screenshot
   - DO NOT save in a file on your computer
   - DO NOT share with ANYONE
   - If you lose these words, you lose your wallet forever!
5. Write them clearly and check your spelling
6. Click "Next"
7. Click the words in the SAME ORDER to confirm you wrote them down
8. Click "Confirm"
9. You'll see "Congratulations!" - Click "Got it!"

### Step 2.3: Add Sepolia Test Network

1. MetaMask is now open - you see your wallet
2. At the TOP, click where it says "Ethereum Mainnet"
3. A dropdown menu appears
4. Click "Show test networks" toggle (turn it ON)
5. Click "Sepolia" in the list
6. Your MetaMask now says "Sepolia test network" at the top ✅

If Sepolia isn't in the list, add it manually:
1. Click "Add network" at the bottom of the dropdown
2. Click "Add a network manually"
3. Fill in these exact values:
   - **Network name**: `Sepolia`
   - **New RPC URL**: `https://rpc.sepolia.org`
   - **Chain ID**: `11155111`
   - **Currency symbol**: `SepoliaETH`
   - **Block explorer URL**: `https://sepolia.etherscan.io`
4. Click "Save"
5. Click "Switch to Sepolia"

### Step 2.4: Get Your Wallet Address

1. Open MetaMask
2. At the top, you'll see something like: `Account 1`
3. Below it is a long code starting with `0x` (like `0xABC123...`)
4. Click this code to copy it
5. Paste it in a text file and save it (you'll need this later)

### Step 2.5: Export Your Private Key

**⚠️ DANGER: This key controls your wallet. NEVER share it! ⚠️**

1. Open MetaMask
2. Click the three dots (⋮) in the top right
3. Click "Account details"
4. Click "Show private key"
5. Enter your MetaMask PASSWORD
6. Click "Hold to reveal Private Key" (hold the button down)
7. You'll see a long code starting with `0x`
8. Click "Copy to clipboard"
9. Open a text file on your computer
10. Paste it and save as `private-key.txt` somewhere SAFE
11. Close MetaMask

**🔒 Security Note:** This file gives complete access to your wallet. Keep it secret!

---

## Part 3: Get Free Test ETH

You need Sepolia ETH to deploy contracts. It's free test cryptocurrency with no real value.

### Method 1: Alchemy Faucet (Easiest)

1. Go to https://sepoliafaucet.com/
2. Click "Sign in with Alchemy"
3. Create an Alchemy account:
   - Click "Sign up"
   - Enter your email
   - Create a password
   - Verify your email (check inbox)
4. After signing in, you're back at the faucet page
5. Paste your wallet address (from Step 2.4) into the box
6. Click "Send Me ETH"
7. Wait 1-2 minutes
8. Open MetaMask - you should see **0.5 SepoliaETH** ✅

### Method 2: QuickNode Faucet

1. Go to https://faucet.quicknode.com/ethereum/sepolia
2. Paste your wallet address
3. Complete the CAPTCHA
4. Click "Continue"
5. Wait 1 minute
6. Check MetaMask for 0.1 SepoliaETH

### Method 3: Google Cloud Faucet

1. Go to https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Sign in with your Google account
3. Paste your wallet address
4. Click "Get Sepolia ETH"
5. Wait 1-2 minutes
6. Check MetaMask

**Verify you have ETH:**
- Open MetaMask
- Make sure "Sepolia" is selected at the top
- You should see a number like `0.5 SepoliaETH` or more
- **You need at least 0.1 SepoliaETH to continue** ✅

---

## Part 4: Get API Keys

### Step 4.1: Get Alchemy API Key

**What is Alchemy?** A service that connects your app to the blockchain.

1. Go to https://www.alchemy.com/
2. Click "Get started for free" (top right)
3. Sign up:
   - Enter email and password
   - Or click "Continue with Google"
4. Verify your email if asked
5. You're now on the Alchemy Dashboard
6. Click "Apps" in the left sidebar (or it might already be selected)
7. Click the blue "+ Create new app" button
8. Fill in the form:
   - **NAME**: `Stablecoin DeFi`
   - **DESCRIPTION**: `DeFi deployment`
   - **CHAIN**: Select `Ethereum`
   - **NETWORK**: Select `Ethereum Sepolia`
9. Click "Create app"
10. You'll see your app in the list
11. Click "API key" button on your app
12. You'll see a code like: `vFj8n4RQ5KXYvL2Hp9qW1mK3Js7Td6Ab`
13. Click "Copy" button next to it
14. Open a text file and paste it - Save as `alchemy-key.txt` ✅

### Step 4.2: Get Etherscan API Key (Optional)

**What is Etherscan?** A website to view blockchain transactions and verify contracts.

1. Go to https://etherscan.io/
2. Click "Sign In" in the top right
3. Click "Sign Up" below the login form
4. Enter:
   - Username
   - Email address
   - Password
5. Click "Create an Account"
6. Check your email for verification link
7. Click the link in the email
8. Sign in to Etherscan
9. Go to https://etherscan.io/myapikey
10. Click the "+ Add" button
11. Enter:
    - **AppName**: `Stablecoin DeFi`
12. Click "Create New API Key"
13. You'll see a key like: `ABC123DEF456GHI789JKL012MNO345PQ`
14. Click "Copy" icon
15. Paste in your text file - Save as `etherscan-key.txt` ✅

---

## Part 5: Download Your Project

### Step 5.1: Find Your Project Folder

First, you need to know where your Stablecoin DeFi project is located on your computer.

**If you cloned it from GitHub:**
- Usually in: `Documents/your-project-name` or `Desktop/your-project-name`

**If someone sent you a zip file:**
1. Extract the zip file to a location you'll remember
2. Good location: `Documents/stablecoin-defi`

**For this guide, let's assume it's in:**
- **Windows**: `C:\Users\YourName\Documents\stablecoin-defi`
- **Mac**: `/Users/YourName/Documents/stablecoin-defi`

### Step 5.2: Open Project in VS Code

**Method 1: From VS Code**
1. Open VS Code
2. Click "File" menu (top left)
3. Click "Open Folder..."
4. Navigate to your project folder
5. Click "Select Folder"

**Method 2: From Folder**
1. Navigate to your project folder in File Explorer/Finder
2. Right-click the folder
3. **Windows**: Click "Open with Code"
4. **Mac**: Right-click while holding Option key, click "Services" > "Open in Visual Studio Code"

**Verify:**
- VS Code left sidebar shows files: `blockchain`, `server`, `src`, `package.json`, etc. ✅

---

## Part 6: Deploy Smart Contracts

### Step 6.1: Open Terminal in VS Code

1. VS Code is open with your project
2. At the very top, click "Terminal" menu
3. Click "New Terminal"
4. A panel opens at the bottom of VS Code
5. This is your terminal - you'll type commands here

**What you should see:**
```
C:\Users\YourName\Documents\stablecoin-defi>
```
or
```
~/Documents/stablecoin-defi %
```

### Step 6.2: Navigate to Blockchain Folder

In the terminal at the bottom of VS Code, type this command:

```bash
cd blockchain
```

Press **Enter**.

The terminal should now show:
```
C:\Users\YourName\Documents\stablecoin-defi\blockchain>
```

**Tip**: If you make a typo, just type the command again!

### Step 6.3: Install Blockchain Dependencies

Type this command:

```bash
npm install
```

Press **Enter**.

**What happens:**
- Text scrolls rapidly (this is normal!)
- You see packages being downloaded
- Lines say things like "added 234 packages"
- Takes 1-2 minutes

**When it's done**, you'll see:
```
added X packages in Ys
```
And you can type again. ✅

**If you see errors:**
- Red text with "ERROR" means something went wrong
- Try running the command again
- Make sure you're in the `blockchain` folder (see Step 6.2)

### Step 6.4: Create Environment File

Now we need to create a file with your private information (API keys, private key).

**In VS Code:**
1. Look at the left sidebar (file explorer)
2. Find the `blockchain` folder
3. Inside `blockchain`, you see a file: `.env.example`
4. Right-click `.env.example`
5. Click "Copy"
6. Right-click the `blockchain` folder
7. Click "Paste"
8. It creates `.env copy.example`
9. Right-click `.env copy.example`
10. Click "Rename"
11. Rename it to just: `.env` (delete the rest)
12. Press Enter

**Alternative method (using terminal):**
In the terminal (still in blockchain folder), type:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Press Enter.

### Step 6.5: Edit Environment File

1. In VS Code left sidebar, click the `.env` file you just created
2. It opens in the main editor
3. You'll see something like:

```env
PRIVATE_KEY=your_metamask_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

4. Now replace the placeholder values with YOUR actual keys:

**Replace `your_metamask_private_key_here`:**
- Open your `private-key.txt` file
- Copy the private key (starts with `0x`)
- Paste it after `PRIVATE_KEY=`

**Replace `your_alchemy_api_key_here`:**
- Open your `alchemy-key.txt` file
- Copy the key
- Paste it after `ALCHEMY_API_KEY=`

**Replace `your_etherscan_api_key_here`:**
- Open your `etherscan-key.txt` file
- Copy the key
- Paste it after `ETHERSCAN_API_KEY=`

**Your .env should now look like:**
```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ALCHEMY_API_KEY=vFj8n4RQ5KXYvL2Hp9qW1mK3Js7Td6Ab
ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL012MNO345PQ
```

5. Press `Ctrl + S` (Windows) or `Cmd + S` (Mac) to SAVE the file

**⚠️ Important:** Make sure there are NO spaces before or after the `=` signs!

### Step 6.6: Compile Smart Contracts

Back in the terminal, type:

```bash
npm run compile
```

Press Enter.

**What happens:**
- Contract files are compiled (translated into blockchain code)
- Takes 30-60 seconds
- You'll see text like "Compiling X files with Solc"

**Success looks like:**
```
Compiled X Solidity files successfully
```
✅

**If you see errors:**
- Red text means compilation failed
- Usually means a problem with the code
- Contact the developer or check the error message

### Step 6.7: Deploy Contracts to Sepolia

**⚠️ IMPORTANT CHECK BEFORE DEPLOYING:**

1. Open MetaMask
2. Make sure it says "Sepolia" at the top
3. Make sure you have at least **0.1 SepoliaETH**

If ready, in the terminal type:

```bash
npm run deploy:sepolia
```

Press Enter.

**What happens:**
- Contracts deploy to Sepolia blockchain
- Takes 3-5 minutes
- Each contract shows a progress message
- You'll see transaction confirmations

**You'll see output like:**

```
=====================================
LATAM DeFi Contract Deployment
=====================================
Network: sepolia (Chain ID: 11155111)
Deploying contracts with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Account balance: 0.5 ETH

1. Deploying LATAM Token...
✅ LATAM Token deployed to: 0x1234567890abcdef1234567890abcdef12345678

2. Deploying USD Stablecoin...
✅ USD Stablecoin deployed to: 0xabcdef1234567890abcdef1234567890abcdef12

3. Deploying BRL Stablecoin...
✅ BRL Stablecoin deployed to: 0x567890abcdef1234567890abcdef1234567890ab

4. Deploying ARS Stablecoin...
✅ ARS Stablecoin deployed to: 0xcdef1234567890abcdef1234567890abcdef1234

5. Deploying Staking Contract...
✅ Staking Contract deployed to: 0x234567890abcdef1234567890abcdef12345678

6. Deploying Morpho Vault Adapter...
✅ Morpho Adapter deployed to: 0x7890abcdef1234567890abcdef1234567890abcd

=====================================
Deployment Summary
=====================================
{
  "latamToken": "0x1234567890abcdef1234567890abcdef12345678",
  "usdStablecoin": "0xabcdef1234567890abcdef1234567890abcdef12",
  "brlStablecoin": "0x567890abcdef1234567890abcdef1234567890ab",
  "arsStablecoin": "0xcdef1234567890abcdef1234567890abcdef1234",
  "staking": "0x234567890abcdef1234567890abcdef12345678",
  "morphoAdapter": "0x7890abcdef1234567890abcdef1234567890abcd"
}

✅ All contracts deployed successfully!
📝 Contract addresses saved to: blockchain/deployments.json
```

**🎉 CONGRATULATIONS! Your contracts are deployed! 🎉**

### Step 6.8: Save Your Contract Addresses

**Critical: Save these addresses!**

1. In VS Code left sidebar, look in `blockchain` folder
2. Find and click `deployments.json` file
3. It contains all your contract addresses
4. Copy ALL the text
5. Open a new text file on your Desktop
6. Paste the addresses
7. Save as `contract-addresses.txt`
8. Keep this file safe - you'll need it! ✅

### Step 6.9: Verify Your Contracts on Etherscan (Optional but Recommended)

This makes your contracts publicly viewable and trusted.

For **each** contract address, run this command (replace `CONTRACT_ADDRESS` with the actual address):

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

**Example for LATAM Token:**
```bash
npx hardhat verify --network sepolia 0x1234567890abcdef1234567890abcdef12345678
```

**Repeat for all 6 contracts:**
1. LATAM Token
2. USD Stablecoin
3. BRL Stablecoin
4. ARS Stablecoin
5. Staking
6. Morpho Adapter

**Success looks like:**
```
Successfully verified contract on Etherscan
https://sepolia.etherscan.io/address/0x123...#code
```

**You can now view your contracts on Etherscan!** Click the links or visit manually.

---

## Part 7: Configure Frontend

### Step 7.1: Go Back to Project Root

In the terminal, type:

```bash
cd ..
```

Press Enter.

This moves you back from `blockchain` folder to main project folder.

Terminal should show:
```
C:\Users\YourName\Documents\stablecoin-defi>
```

### Step 7.2: Create Contract Configuration File

**Using VS Code:**
1. In left sidebar, find `src` folder
2. Inside `src`, you might see a `config` folder
   - **If YES**: Continue to step 3
   - **If NO**: Right-click `src`, click "New Folder", name it `config`
3. Right-click the `config` folder
4. Click "New File"
5. Name it: `contracts.ts`
6. Press Enter

The file opens in the editor.

### Step 7.3: Add Contract Configuration

Paste this code into `contracts.ts` (replace the addresses with YOUR addresses from deployments.json):

```typescript
export interface ContractAddresses {
  chainId: number;
  latamToken: string;
  usdStablecoin: string;
  brlStablecoin: string;
  arsStablecoin: string;
  staking: string;
  morphoAdapter: string;
  rpcUrl: string;
}

export const SEPOLIA_CONTRACTS: ContractAddresses = {
  chainId: 11155111,
  latamToken: '0xYOUR_LATAM_TOKEN_ADDRESS',
  usdStablecoin: '0xYOUR_USD_STABLECOIN_ADDRESS',
  brlStablecoin: '0xYOUR_BRL_STABLECOIN_ADDRESS',
  arsStablecoin: '0xYOUR_ARS_STABLECOIN_ADDRESS',
  staking: '0xYOUR_STAKING_ADDRESS',
  morphoAdapter: '0xYOUR_MORPHO_ADAPTER_ADDRESS',
  rpcUrl: 'https://rpc.sepolia.org'
};

export const getContracts = (): ContractAddresses => {
  return SEPOLIA_CONTRACTS;
};
```

**Now replace each address:**
1. Open your `contract-addresses.txt` file (or `deployments.json`)
2. Copy the `latamToken` address
3. Replace `0xYOUR_LATAM_TOKEN_ADDRESS` with it
4. Repeat for all 6 contracts

**Save the file** (`Ctrl + S` or `Cmd + S`)

### Step 7.4: Update Frontend Environment File

1. In VS Code left sidebar, click the `.env` file in the **root** folder (not in blockchain!)
2. You'll see Supabase configuration already there
3. **Add these lines** at the bottom:

```env
# Blockchain Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
VITE_NETWORK_NAME=Sepolia

# Contract Addresses
VITE_LATAM_TOKEN_ADDRESS=0xYOUR_LATAM_TOKEN_ADDRESS
VITE_USD_STABLECOIN_ADDRESS=0xYOUR_USD_STABLECOIN_ADDRESS
VITE_BRL_STABLECOIN_ADDRESS=0xYOUR_BRL_STABLECOIN_ADDRESS
VITE_ARS_STABLECOIN_ADDRESS=0xYOUR_ARS_STABLECOIN_ADDRESS
VITE_STAKING_ADDRESS=0xYOUR_STAKING_ADDRESS
VITE_MORPHO_ADAPTER_ADDRESS=0xYOUR_MORPHO_ADAPTER_ADDRESS

# Backend API URL
VITE_API_URL=http://localhost:3001
```

4. Replace all the `0xYOUR_...` addresses with your actual addresses
5. Save the file (`Ctrl + S` or `Cmd + S`)

### Step 7.5: Install Frontend Dependencies

In the terminal (make sure you're in project root, not blockchain folder), type:

```bash
npm install
```

Press Enter.

**What happens:**
- Downloads all packages needed for the frontend
- Takes 2-3 minutes
- Shows progress bars

**Success:**
```
added X packages in Ys
```
✅

### Step 7.6: Build Frontend

Type:

```bash
npm run build
```

Press Enter.

**What happens:**
- Creates optimized production version of your website
- Takes 30-60 seconds
- Shows progress messages

**Success looks like:**
```
✓ built in 12.43s
```
✅

---

## Part 8: Configure Backend

### Step 8.1: Navigate to Server Folder

In the terminal, type:

```bash
cd server
```

Press Enter.

### Step 8.2: Install Backend Dependencies

Type:

```bash
npm install
```

Press Enter.

Wait 1-2 minutes for installation.

### Step 8.3: Create Backend Environment File

**Using terminal:**

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Press Enter.

### Step 8.4: Edit Backend Environment File

1. In VS Code left sidebar, find `server` folder
2. Click the `.env` file inside `server`
3. You'll see configuration variables
4. **Keep the existing Supabase settings** (DON'T change them!)
5. **Add these lines** at the bottom (replace with your addresses):

```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=sepolia
CHAIN_ID=11155111
RPC_URL=https://rpc.sepolia.org

# Contract Addresses
LATAM_TOKEN_ADDRESS=0xYOUR_LATAM_TOKEN_ADDRESS
USD_STABLECOIN_ADDRESS=0xYOUR_USD_STABLECOIN_ADDRESS
BRL_STABLECOIN_ADDRESS=0xYOUR_BRL_STABLECOIN_ADDRESS
ARS_STABLECOIN_ADDRESS=0xYOUR_ARS_STABLECOIN_ADDRESS
STAKING_ADDRESS=0xYOUR_STAKING_ADDRESS
MORPHO_ADAPTER_ADDRESS=0xYOUR_MORPHO_ADAPTER_ADDRESS
```

6. Replace all addresses with your actual contract addresses
7. Save the file (`Ctrl + S` or `Cmd + S`)

---

## Part 9: Test Everything Locally

### Step 9.1: Start Backend Server

**In the terminal** (should be in `server` folder):

Type:

```bash
npm start
```

Press Enter.

**What happens:**
- Backend server starts
- Shows startup messages

**Success looks like:**
```
LATAM DeFi API server running on port 3001
Environment: development
Health check: http://localhost:3001/api/health
```

**Leave this terminal running! Don't close it!** ✅

### Step 9.2: Start Frontend (New Terminal)

We need to open a SECOND terminal because the first is running the backend.

**In VS Code:**
1. Click "Terminal" menu at top
2. Click "New Terminal"
3. A second terminal panel opens
4. This new terminal is in the project root

**If it opened in the wrong folder**, type:
```bash
cd ..
```
(This goes up one folder from server to root)

Now type:

```bash
npm run dev
```

Press Enter.

**What happens:**
- Frontend development server starts
- Shows startup messages

**Success looks like:**
```
  VITE ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Leave this terminal running too!** ✅

### Step 9.3: Open Your App in Browser

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Type this in the address bar:
```
http://localhost:5173
```
3. Press Enter

**Your Stablecoin DeFi app opens!** 🎉

### Step 9.4: Connect Your Wallet

1. On the website, find the "Connect Wallet" button (usually top right)
2. Click it
3. MetaMask popup appears
4. Click "Next"
5. Click "Connect"
6. Your wallet address appears in the navbar ✅

**If MetaMask asks to switch networks:**
- Click "Switch network"
- Select "Sepolia"

### Step 9.5: Test Beta Sign-Up

1. In your browser, go to:
```
http://localhost:5173/beta
```
2. Fill in:
   - Email: Your email
   - Nickname: Any nickname
3. Click "Sign me up!" or "¡Registrarme!"
4. You should see a success message ✅

**Verify in Supabase:**
1. Go to https://supabase.com/
2. Sign in to your project
3. Click "Table Editor" in left menu
4. Click "beta_testers" table
5. You should see your entry! ✅

### Step 9.6: Test Dashboard

1. Go to:
```
http://localhost:5173/dashboard
```
2. You should see:
   - Your wallet address
   - Balance information
   - Stablecoin cards
3. **Note**: Some features won't work yet until you add liquidity/tokens ✅

---

## Part 10: Deploy to Production (Optional)

If you want your app accessible on the internet, follow these steps.

### Step 10.1: Deploy Backend to Railway

**Create Railway Account:**
1. Go to https://railway.app/
2. Click "Login"
3. Click "Login with GitHub"
4. Authorize Railway

**Deploy Backend:**
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Click "Configure GitHub App"
4. Select your repository
5. Back on Railway, select your repository
6. Railway detects your code and starts deploying
7. Click "Settings" tab
8. Scroll to "Root Directory"
9. Enter: `server`
10. Click "Variables" tab
11. Click "Add Variable"
12. Add ALL variables from your `server/.env` file one by one:
    - Click "+ New Variable"
    - **Name**: `PORT`, **Value**: `3001`
    - **Name**: `SUPABASE_URL`, **Value**: Your Supabase URL
    - **Name**: `SUPABASE_SERVICE_ROLE_KEY`, **Value**: Your key
    - **Name**: `JWT_SECRET`, **Value**: Your secret
    - (Add all the blockchain variables too)
13. Click "Deployments" tab
14. Wait for deployment to finish (green checkmark)
15. Click "Settings" tab
16. Under "Domains", click "Generate Domain"
17. Copy your backend URL (like `https://stablecoin-api.railway.app`)

**Save this URL!** ✅

### Step 10.2: Deploy Frontend to Vercel

**Create Vercel Account:**
1. Go to https://vercel.com/
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel

**Deploy Frontend:**
1. Click "Add New..." button
2. Click "Project"
3. Click "Import" next to your repository
4. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Environment Variables"
6. Add these variables:
   - `VITE_CHAIN_ID` = `11155111`
   - `VITE_RPC_URL` = `https://rpc.sepolia.org`
   - `VITE_API_URL` = `https://your-backend.railway.app` (from Step 10.1)
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - (Add all contract address variables)
7. Click "Deploy"
8. Wait 2-3 minutes
9. You'll see "Congratulations!" 🎉
10. Your app is live at: `https://your-app.vercel.app`

**Visit your live app!** Share the link with others! ✅

---

## Part 11: Final Testing

### Test on Your Live Website

1. Go to your Vercel URL
2. Connect MetaMask
3. Make sure you're on Sepolia network
4. Try navigating to different pages:
   - Dashboard
   - Earn
   - Borrow
   - Governance
   - Beta sign-up
5. Test the beta sign-up form
6. Check if everything loads correctly

### View Your Contracts on Etherscan

1. Go to https://sepolia.etherscan.io/
2. Paste one of your contract addresses in the search box
3. Press Enter
4. You'll see your contract page with:
   - Transaction history
   - Contract code (if you verified)
   - Token information

**Bookmark these pages!** ✅

---

## Troubleshooting Common Issues

### Issue: "Insufficient funds" when deploying

**Solution:**
- Check MetaMask balance
- Need at least 0.1 SepoliaETH
- Get more from faucets (see Part 3)

### Issue: "Network mismatch" in browser

**Solution:**
- Open MetaMask
- Click network dropdown
- Select "Sepolia"
- Refresh page

### Issue: "Cannot find module" error

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend can't connect to contracts

**Solution:**
- Verify contract addresses in `.env` file
- Make sure they match `deployments.json`
- Check no extra spaces in `.env`
- Rebuild frontend: `npm run build`

### Issue: MetaMask not appearing

**Solution:**
- Refresh the page
- Make sure MetaMask extension is enabled
- Try a different browser
- Reinstall MetaMask if needed

### Issue: Backend won't start

**Solution:**
- Check all environment variables in `server/.env`
- Make sure port 3001 isn't already in use
- Try running on different port:
  - Change `PORT=3002` in `.env`
  - Run `npm start` again

---

## Next Steps

### Things to Try

1. **Add test tokens to your wallet**:
   - Copy your wallet address
   - In terminal (blockchain folder):
   ```bash
   npx hardhat console --network sepolia
   ```
   - Mint test tokens to yourself

2. **Register Morpho vaults**:
   - Find Sepolia Morpho vaults
   - Register them in your MorphoVaultAdapter

3. **Test all features**:
   - Mint stablecoins
   - Stake tokens
   - Create governance proposals

4. **Share with friends**:
   - Send them your Vercel URL
   - They can test the beta sign-up
   - Get feedback

### Important Security Notes

**For Testnet (Sepolia):**
- ✅ Safe to use and test
- ✅ ETH has no real value
- ✅ OK to share testnet addresses
- ✅ Good for learning

**For Mainnet (Real Money):**
- ⚠️ NEVER use your testnet private key
- ⚠️ Get a professional security audit first
- ⚠️ Use hardware wallet (Ledger/Trezor)
- ⚠️ Test EVERYTHING thoroughly on testnet first
- ⚠️ Start with small amounts

---

## Congratulations! 🎉

You've successfully deployed a complete DeFi application to the Sepolia testnet!

**What you accomplished:**
- ✅ Set up development environment
- ✅ Created and funded a wallet
- ✅ Deployed 6 smart contracts to Sepolia
- ✅ Connected frontend to contracts
- ✅ Set up backend with database
- ✅ Deployed to production (if you did Part 10)
- ✅ Created a fully functional DeFi application

**Important Files to Keep Safe:**
- `blockchain/deployments.json` - Contract addresses
- `private-key.txt` - Your wallet private key (NEVER share!)
- `contract-addresses.txt` - Backup of addresses
- `alchemy-key.txt` - API key
- `etherscan-key.txt` - API key

**Resources:**
- Your frontend: `https://your-app.vercel.app`
- Your backend: `https://your-api.railway.app`
- Etherscan: `https://sepolia.etherscan.io`
- This guide: Keep it handy!

**Need Help?**
- Check the troubleshooting section above
- Review error messages carefully
- Google specific error messages
- Join DeFi developer communities

---

**Total Time Spent**: 3-4 hours
**Cost**: $0 (free testnet!)
**Knowledge Gained**: Priceless 🚀

Good luck with your DeFi journey!
