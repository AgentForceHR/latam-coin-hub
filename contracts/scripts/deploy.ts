import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting Estable Beta Contracts Deployment to Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts: any = {};

  console.log("1. Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  deployedContracts.mockUSDC = usdcAddress;
  console.log("✅ Mock USDC deployed to:", usdcAddress);
  console.log("");

  console.log("2. Deploying Mock USDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  deployedContracts.mockUSDT = usdtAddress;
  console.log("✅ Mock USDT deployed to:", usdtAddress);
  console.log("");

  console.log("3. Deploying Estable Token (EST)...");
  const EstableToken = await ethers.getContractFactory("EstableToken");
  const est = await EstableToken.deploy();
  await est.waitForDeployment();
  const estAddress = await est.getAddress();
  deployedContracts.estableToken = estAddress;
  console.log("✅ Estable Token deployed to:", estAddress);
  console.log("");

  console.log("4. Deploying USDC Vault...");
  const EstableVault = await ethers.getContractFactory("EstableVault");
  const usdcVault = await EstableVault.deploy(usdcAddress, estAddress);
  await usdcVault.waitForDeployment();
  const usdcVaultAddress = await usdcVault.getAddress();
  deployedContracts.usdcVault = usdcVaultAddress;
  console.log("✅ USDC Vault deployed to:", usdcVaultAddress);
  console.log("");

  console.log("5. Deploying USDT Vault...");
  const usdtVault = await EstableVault.deploy(usdtAddress, estAddress);
  await usdtVault.waitForDeployment();
  const usdtVaultAddress = await usdtVault.getAddress();
  deployedContracts.usdtVault = usdtVaultAddress;
  console.log("✅ USDT Vault deployed to:", usdtVaultAddress);
  console.log("");

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployedContracts, null, 2));

  console.log("📄 Deployment addresses saved to deployments.json");
  console.log("");
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Mock USDC:       ", usdcAddress);
  console.log("Mock USDT:       ", usdtAddress);
  console.log("Estable Token:   ", estAddress);
  console.log("USDC Vault:      ", usdcVaultAddress);
  console.log("USDT Vault:      ", usdtVaultAddress);
  console.log("=".repeat(60));
  console.log("");
  console.log("⚠️  TESTNET ONLY - NO REAL VALUE");
  console.log("🔗 Network: Base Sepolia (Chain ID: 84532)");
  console.log("🌐 Explorer: https://sepolia.basescan.org");
  console.log("");
  console.log("Next steps:");
  console.log("1. Copy deployments.json addresses to your .env file");
  console.log("2. Verify contracts on BaseScan (optional)");
  console.log("3. Test faucet functions to get test tokens");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
