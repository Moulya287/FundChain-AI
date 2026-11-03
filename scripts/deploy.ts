
import { network } from "hardhat";

async function main() {
  console.log("Connecting to local Hardhat network...");

  const { viem } = await network.connect("localhost");

  console.log("Deploying FundChain contract...");

  const fundChain = await viem.deployContract("FundChain");

  console.log("FundChain deployed successfully!");
  console.log("Contract address:", fundChain.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
