const { ethers, upgrades } = require("hardhat");

// Base Sepolia WETH address (native wrapped ETH)
const WETH_BASE_SEPOLIA = "0x4200000000000000000000000000000000000006";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying Escovra (ERC-8183) to Base Sepolia");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Treasury = deployer for testnet (change for mainnet)
  const TREASURY = deployer.address;

  // Deploy UUPS Proxy
  const AgenticCommerce = await ethers.getContractFactory("AgenticCommerce");
  console.log("\nDeploying AgenticCommerce proxy...");

  const proxy = await upgrades.deployProxy(
    AgenticCommerce,
    [WETH_BASE_SEPOLIA, TREASURY],
    { initializer: "initialize", kind: "uups" }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("\n✅ Escovra deployed!");
  console.log("Proxy address:      ", proxyAddress);
  console.log("Payment token (WETH):", WETH_BASE_SEPOLIA);
  console.log("Treasury:            ", TREASURY);
  console.log("\nBase Sepolia Explorer:");
  console.log(`https://sepolia.basescan.org/address/${proxyAddress}`);

  // Optional: set platform fee (250 = 2.5%)
  // console.log("\nSetting platform fee to 2.5%...");
  // await proxy.setPlatformFee(250, TREASURY);

  // Save deployment info
  const fs = require("fs");
  const deployInfo = {
    network: "baseSepolia",
    chainId: 84532,
    proxy: proxyAddress,
    paymentToken: WETH_BASE_SEPOLIA,
    treasury: TREASURY,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  fs.writeFileSync(
    "./deployments/baseSepolia.json",
    JSON.stringify(deployInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments/baseSepolia.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
