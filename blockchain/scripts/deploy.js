const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=====================================");
  console.log("LATAM DeFi Contract Deployment");
  console.log("=====================================");
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  const deployedContracts = {};

  // 1. Deploy LATAM Token
  console.log("1. Deploying LATAM Token...");
  const LATAMToken = await ethers.getContractFactory("LATAMToken");
  const latamToken = await LATAMToken.deploy();
  await latamToken.waitForDeployment();
  const latamAddress = await latamToken.getAddress();
  deployedContracts.latamToken = latamAddress;
  console.log("✅ LATAM Token deployed to:", latamAddress);
  console.log("");

  // 2. Deploy USD Stablecoin
  console.log("2. Deploying USD Stablecoin...");
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const usdStablecoin = await Stablecoin.deploy("LATAM USD", "LUSD", 100); // 1:1 peg (100 basis points)
  await usdStablecoin.waitForDeployment();
  const usdAddress = await usdStablecoin.getAddress();
  deployedContracts.usdStablecoin = usdAddress;
  console.log("✅ USD Stablecoin deployed to:", usdAddress);
  console.log("");

  // 3. Deploy BRL Stablecoin
  console.log("3. Deploying BRL Stablecoin...");
  const brlStablecoin = await Stablecoin.deploy("LATAM BRL", "LBRL", 550); // 5.5:1 peg (550 basis points)
  await brlStablecoin.waitForDeployment();
  const brlAddress = await brlStablecoin.getAddress();
  deployedContracts.brlStablecoin = brlAddress;
  console.log("✅ BRL Stablecoin deployed to:", brlAddress);
  console.log("");

  // 4. Deploy ARS Stablecoin
  console.log("4. Deploying ARS Stablecoin...");
  const arsStablecoin = await Stablecoin.deploy("LATAM ARS", "LARS", 95000); // 950:1 peg (95000 basis points)
  await arsStablecoin.waitForDeployment();
  const arsAddress = await arsStablecoin.getAddress();
  deployedContracts.arsStablecoin = arsAddress;
  console.log("✅ ARS Stablecoin deployed to:", arsAddress);
  console.log("");

  // 5. Deploy Staking Contract
  console.log("5. Deploying Staking Contract...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(latamAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  deployedContracts.staking = stakingAddress;
  console.log("✅ Staking Contract deployed to:", stakingAddress);
  console.log("");

  // Save addresses to file
  const deploymentsPath = path.join(__dirname, '../deployments.json');
  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(deployedContracts, null, 2)
  );

  console.log("=====================================");
  console.log("Deployment Summary");
  console.log("=====================================");
  console.log(JSON.stringify(deployedContracts, null, 2));
  console.log("");
  console.log("✅ All contracts deployed successfully!");
  console.log("📝 Contract addresses saved to:", deploymentsPath);
  console.log("");
  console.log("Next steps:");
  console.log("1. Copy these addresses to your frontend config");
  console.log("2. Copy these addresses to your backend .env");
  console.log("3. Verify contracts on BSCScan (optional):");
  console.log("   npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
