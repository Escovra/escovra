const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AgentRegistry to Base Sepolia...");
  console.log("Deployer:", deployer.address);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\nAgentRegistry deployed:", address);
  console.log("Explorer:", `https://sepolia.basescan.org/address/${address}`);

  const fs = require("fs");
  const existing = JSON.parse(fs.readFileSync("./deployments/baseSepolia.json", "utf8").replace("{}", "{}"));
  existing.agentRegistry = address;
  fs.writeFileSync("./deployments/baseSepolia.json", JSON.stringify(existing, null, 2));
  console.log("Saved to deployments/baseSepolia.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
