import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeployedContracts {
  mockUSDC: string;
  mockUSDT: string;
  estToken: string;
  yieldVault: string;
  estStake: string;
  network: string;
  chainId: number;
  deployer: string;
  timestamp: number;
}

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Estable Beta Contracts Deployment - Base Sepolia       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📋 Deployment Information:");
  console.log("━".repeat(60));
  console.log(`Deployer Address:  ${deployer.address}`);
  console.log(`Network:           ${network.name}`);
  console.log(`Chain ID:          ${network.chainId}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log("━".repeat(60));
  console.log("");

  const deployedContracts: DeployedContracts = {
    mockUSDC: "",
    mockUSDT: "",
    estToken: "",
    yieldVault: "",
    estStake: "",
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: Date.now(),
  };

  try {
    console.log("1️⃣  Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    deployedContracts.mockUSDC = mockUSDCAddress;
    console.log(`✅ MockUSDC deployed to: ${mockUSDCAddress}\n`);

    console.log("2️⃣  Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    const mockUSDTAddress = await mockUSDT.getAddress();
    deployedContracts.mockUSDT = mockUSDTAddress;
    console.log(`✅ MockUSDT deployed to: ${mockUSDTAddress}\n`);

    console.log("3️⃣  Deploying EstToken...");
    const EstToken = await ethers.getContractFactory("EstToken");
    const estToken = await EstToken.deploy();
    await estToken.waitForDeployment();
    const estTokenAddress = await estToken.getAddress();
    deployedContracts.estToken = estTokenAddress;
    console.log(`✅ EstToken deployed to: ${estTokenAddress}\n`);

    console.log("4️⃣  Deploying YieldVault...");
    const YieldVault = await ethers.getContractFactory("YieldVault");
    const yieldVault = await YieldVault.deploy(
      estTokenAddress,
      "Estable Yield Vault",
      "eyvUSD"
    );
    await yieldVault.waitForDeployment();
    const yieldVaultAddress = await yieldVault.getAddress();
    deployedContracts.yieldVault = yieldVaultAddress;
    console.log(`✅ YieldVault deployed to: ${yieldVaultAddress}`);

    console.log("   Adding supported assets...");
    await yieldVault.addAsset(mockUSDCAddress, 800);
    console.log("   ✓ Added mUSDC");
    await yieldVault.addAsset(mockUSDTAddress, 1200);
    console.log("   ✓ Added mUSDT\n");

    console.log("5️⃣  Deploying EstStake...");
    const EstStake = await ethers.getContractFactory("EstStake");
    const estStake = await EstStake.deploy(estTokenAddress);
    await estStake.waitForDeployment();
    const estStakeAddress = await estStake.getAddress();
    deployedContracts.estStake = estStakeAddress;
    console.log(`✅ EstStake deployed to: ${estStakeAddress}\n`);

    const deploymentsPath = path.join(__dirname, "../deployments.json");
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployedContracts, null, 2));

    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║              DEPLOYMENT SUMMARY                           ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("Contract Addresses:");
    console.log("━".repeat(60));
    console.log(`MockUSDC:     ${mockUSDCAddress}`);
    console.log(`MockUSDT:     ${mockUSDTAddress}`);
    console.log(`EstToken:     ${estTokenAddress}`);
    console.log(`YieldVault:   ${yieldVaultAddress}`);
    console.log(`EstStake:     ${estStakeAddress}`);
    console.log("━".repeat(60));
    console.log("");
    console.log("⚠️  TESTNET ONLY - NO REAL VALUE");
    console.log("🔗 Explorer: https://sepolia.basescan.org");
    console.log("");
    console.log("Next: Update .env with addresses and verify contracts:");
    console.log("npx hardhat verify --network baseSepolia <ADDRESS>");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
