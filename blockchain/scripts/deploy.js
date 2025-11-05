const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=====================================");
  console.log("Estable DeFi Contract Deployment");
  console.log("=====================================");
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  const deployedContracts = {};

  // 1. Deploy Estable Token
  console.log("1. Deploying Estable Token (EST)...");
  const EstableToken = await ethers.getContractFactory("EstableToken");
  const estableToken = await EstableToken.deploy();
  await estableToken.waitForDeployment();
  const estableAddress = await estableToken.getAddress();
  deployedContracts.estableToken = estableAddress;
  console.log("✅ Estable Token deployed to:", estableAddress);
  console.log("");

  // 2. Deploy USD Stablecoin
  console.log("2. Deploying USD Stablecoin...");
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const usdStablecoin = await Stablecoin.deploy("Estable USD", "EUSD", 100); // 1:1 peg (100 basis points)
  await usdStablecoin.waitForDeployment();
  const usdAddress = await usdStablecoin.getAddress();
  deployedContracts.usdStablecoin = usdAddress;
  console.log("✅ USD Stablecoin deployed to:", usdAddress);
  console.log("");

  // 3. Deploy BRL Stablecoin
  console.log("3. Deploying BRL Stablecoin...");
  const brlStablecoin = await Stablecoin.deploy("Estable BRL", "EBRL", 550); // 5.5:1 peg (550 basis points)
  await brlStablecoin.waitForDeployment();
  const brlAddress = await brlStablecoin.getAddress();
  deployedContracts.brlStablecoin = brlAddress;
  console.log("✅ BRL Stablecoin deployed to:", brlAddress);
  console.log("");

  // 4. Deploy ARS Stablecoin
  console.log("4. Deploying ARS Stablecoin...");
  const arsStablecoin = await Stablecoin.deploy("Estable ARS", "EARS", 95000); // 950:1 peg (95000 basis points)
  await arsStablecoin.waitForDeployment();
  const arsAddress = await arsStablecoin.getAddress();
  deployedContracts.arsStablecoin = arsAddress;
  console.log("✅ ARS Stablecoin deployed to:", arsAddress);
  console.log("");

  // 5. Deploy MXN Stablecoin
  console.log("5. Deploying MXN Stablecoin...");
  const mxnStablecoin = await Stablecoin.deploy("Estable MXN", "EMXN", 1700); // 17:1 peg (1700 basis points)
  await mxnStablecoin.waitForDeployment();
  const mxnAddress = await mxnStablecoin.getAddress();
  deployedContracts.mxnStablecoin = mxnAddress;
  console.log("✅ MXN Stablecoin deployed to:", mxnAddress);
  console.log("");

  // 6. Deploy COP Stablecoin
  console.log("6. Deploying COP Stablecoin...");
  const copStablecoin = await Stablecoin.deploy("Estable COP", "ECOP", 400000); // 4000:1 peg (400000 basis points)
  await copStablecoin.waitForDeployment();
  const copAddress = await copStablecoin.getAddress();
  deployedContracts.copStablecoin = copAddress;
  console.log("✅ COP Stablecoin deployed to:", copAddress);
  console.log("");

  // 7. Deploy Staking Contract
  console.log("7. Deploying Staking Contract...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(estableAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  deployedContracts.staking = stakingAddress;
  console.log("✅ Staking Contract deployed to:", stakingAddress);
  console.log("");

  // 8. Deploy Morpho Vault Adapter
  console.log("8. Deploying Morpho Vault Adapter...");
  const MorphoVaultAdapter = await ethers.getContractFactory("MorphoVaultAdapter");
  const morphoAdapter = await MorphoVaultAdapter.deploy();
  await morphoAdapter.waitForDeployment();
  const morphoAddress = await morphoAdapter.getAddress();
  deployedContracts.morphoAdapter = morphoAddress;
  console.log("✅ Morpho Adapter deployed to:", morphoAddress);
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
  console.log("3. Verify contracts on Etherscan (optional):");
  console.log("   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>");
  console.log("");
  console.log("Important: Save the deployments.json file!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
