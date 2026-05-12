const hre = require("hardhat");

async function main() {
  const n = await hre.ethers.provider.getBlockNumber();
  console.log(n.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
