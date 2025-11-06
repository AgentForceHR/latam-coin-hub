#!/bin/bash

# Quick Setup Script for LATAM Coin Hub Beta
# This script helps you set up and run the project quickly

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     LATAM Coin Hub - Quick Setup Script                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node --version)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: You need to add your PRIVATE_KEY to .env${NC}"
    echo ""
    echo "Please edit .env and add your private key:"
    echo "  nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if PRIVATE_KEY is set
if ! grep -q "PRIVATE_KEY=0x" .env; then
    echo ""
    echo -e "${YELLOW}⚠️  PRIVATE_KEY not set in .env${NC}"
    echo ""
    echo "Please edit .env and add your private key:"
    echo "  nano .env"
    echo ""
    echo "Find this line:"
    echo "  PRIVATE_KEY="
    echo ""
    echo "Replace it with:"
    echo "  PRIVATE_KEY=0xYourPrivateKeyHere"
    echo ""
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "What would you like to do?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1) Install dependencies"
echo "2) Deploy contracts to Base Sepolia"
echo "3) Update .env with deployed contract addresses"
echo "4) Start development server"
echo "5) Run all steps (1 → 2 → 3 → 4)"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Installing main dependencies..."
        npm install
        echo ""
        echo "Installing contract dependencies..."
        cd contracts
        npm install
        cd ..
        echo ""
        echo -e "${GREEN}✅ All dependencies installed${NC}"
        ;;

    2)
        echo ""
        echo "Compiling contracts..."
        cd contracts
        npx hardhat compile
        echo ""
        echo "Deploying to Base Sepolia..."
        npx hardhat run scripts/deploy.ts --network baseSepolia
        cd ..
        echo ""
        echo -e "${GREEN}✅ Contracts deployed${NC}"
        echo ""
        echo "Next step: Update .env with contract addresses"
        echo "Run: ./quick-setup.sh and select option 3"
        ;;

    3)
        if [ ! -f "contracts/deployments.json" ]; then
            echo -e "${RED}❌ deployments.json not found${NC}"
            echo "Please deploy contracts first (option 2)"
            exit 1
        fi

        echo ""
        echo "Reading deployed contract addresses..."

        # Extract addresses from deployments.json
        MOCK_USDC=$(node -e "console.log(require('./contracts/deployments.json').mockUSDC)")
        MOCK_USDT=$(node -e "console.log(require('./contracts/deployments.json').mockUSDT)")
        EST_TOKEN=$(node -e "console.log(require('./contracts/deployments.json').estToken)")
        YIELD_VAULT=$(node -e "console.log(require('./contracts/deployments.json').yieldVault)")
        EST_STAKE=$(node -e "console.log(require('./contracts/deployments.json').estStake)")

        echo "Updating .env file..."

        # Update or add addresses in .env
        if grep -q "VITE_MOCK_USDC_ADDRESS=" .env; then
            sed -i.bak "s|VITE_MOCK_USDC_ADDRESS=.*|VITE_MOCK_USDC_ADDRESS=$MOCK_USDC|" .env
        else
            echo "VITE_MOCK_USDC_ADDRESS=$MOCK_USDC" >> .env
        fi

        if grep -q "VITE_MOCK_USDT_ADDRESS=" .env; then
            sed -i.bak "s|VITE_MOCK_USDT_ADDRESS=.*|VITE_MOCK_USDT_ADDRESS=$MOCK_USDT|" .env
        else
            echo "VITE_MOCK_USDT_ADDRESS=$MOCK_USDT" >> .env
        fi

        if grep -q "VITE_EST_TOKEN_ADDRESS=" .env; then
            sed -i.bak "s|VITE_EST_TOKEN_ADDRESS=.*|VITE_EST_TOKEN_ADDRESS=$EST_TOKEN|" .env
        else
            echo "VITE_EST_TOKEN_ADDRESS=$EST_TOKEN" >> .env
        fi

        if grep -q "VITE_YIELD_VAULT_ADDRESS=" .env; then
            sed -i.bak "s|VITE_YIELD_VAULT_ADDRESS=.*|VITE_YIELD_VAULT_ADDRESS=$YIELD_VAULT|" .env
        else
            echo "VITE_YIELD_VAULT_ADDRESS=$YIELD_VAULT" >> .env
        fi

        if grep -q "VITE_EST_STAKE_ADDRESS=" .env; then
            sed -i.bak "s|VITE_EST_STAKE_ADDRESS=.*|VITE_EST_STAKE_ADDRESS=$EST_STAKE|" .env
        else
            echo "VITE_EST_STAKE_ADDRESS=$EST_STAKE" >> .env
        fi

        rm -f .env.bak

        echo ""
        echo -e "${GREEN}✅ .env updated with contract addresses${NC}"
        echo ""
        echo "Contract Addresses:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "MockUSDC:     $MOCK_USDC"
        echo "MockUSDT:     $MOCK_USDT"
        echo "EstToken:     $EST_TOKEN"
        echo "YieldVault:   $YIELD_VAULT"
        echo "EstStake:     $EST_STAKE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        ;;

    4)
        echo ""
        echo "Starting development server..."
        echo ""
        echo -e "${GREEN}➜  Open your browser to: http://localhost:5173/beta${NC}"
        echo ""
        npm run dev
        ;;

    5)
        echo ""
        echo "Running full setup..."
        echo ""

        # Step 1: Install dependencies
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Step 1/4: Installing dependencies..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        npm install
        cd contracts
        npm install
        cd ..
        echo -e "${GREEN}✅ Dependencies installed${NC}"
        echo ""

        # Step 2: Deploy contracts
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Step 2/4: Deploying contracts..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cd contracts
        npx hardhat compile
        npx hardhat run scripts/deploy.ts --network baseSepolia
        cd ..
        echo -e "${GREEN}✅ Contracts deployed${NC}"
        echo ""

        # Step 3: Update .env
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Step 3/4: Updating .env with contract addresses..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        MOCK_USDC=$(node -e "console.log(require('./contracts/deployments.json').mockUSDC)")
        MOCK_USDT=$(node -e "console.log(require('./contracts/deployments.json').mockUSDT)")
        EST_TOKEN=$(node -e "console.log(require('./contracts/deployments.json').estToken)")
        YIELD_VAULT=$(node -e "console.log(require('./contracts/deployments.json').yieldVault)")
        EST_STAKE=$(node -e "console.log(require('./contracts/deployments.json').estStake)")

        if grep -q "VITE_MOCK_USDC_ADDRESS=" .env; then
            sed -i.bak "s|VITE_MOCK_USDC_ADDRESS=.*|VITE_MOCK_USDC_ADDRESS=$MOCK_USDC|" .env
        else
            echo "VITE_MOCK_USDC_ADDRESS=$MOCK_USDC" >> .env
        fi

        if grep -q "VITE_MOCK_USDT_ADDRESS=" .env; then
            sed -i.bak "s|VITE_MOCK_USDT_ADDRESS=.*|VITE_MOCK_USDT_ADDRESS=$MOCK_USDT|" .env
        else
            echo "VITE_MOCK_USDT_ADDRESS=$MOCK_USDT" >> .env
        fi

        if grep -q "VITE_EST_TOKEN_ADDRESS=" .env; then
            sed -i.bak "s|VITE_EST_TOKEN_ADDRESS=.*|VITE_EST_TOKEN_ADDRESS=$EST_TOKEN|" .env
        else
            echo "VITE_EST_TOKEN_ADDRESS=$EST_TOKEN" >> .env
        fi

        if grep -q "VITE_YIELD_VAULT_ADDRESS=" .env; then
            sed -i.bak "s|VITE_YIELD_VAULT_ADDRESS=.*|VITE_YIELD_VAULT_ADDRESS=$YIELD_VAULT|" .env
        else
            echo "VITE_YIELD_VAULT_ADDRESS=$YIELD_VAULT" >> .env
        fi

        if grep -q "VITE_EST_STAKE_ADDRESS=" .env; then
            sed -i.bak "s|VITE_EST_STAKE_ADDRESS=.*|VITE_EST_STAKE_ADDRESS=$EST_STAKE|" .env
        else
            echo "VITE_EST_STAKE_ADDRESS=$EST_STAKE" >> .env
        fi

        rm -f .env.bak

        echo -e "${GREEN}✅ .env updated${NC}"
        echo ""

        # Step 4: Start server
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Step 4/4: Starting development server..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo -e "${GREEN}➜  Open your browser to: http://localhost:5173/beta${NC}"
        echo ""
        npm run dev
        ;;

    6)
        echo "Goodbye!"
        exit 0
        ;;

    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
