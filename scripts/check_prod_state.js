const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  const rewardAddr = process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS;
  const tokenAddr = process.env.NEXT_PUBLIC_DDC_TOKEN_ADDRESS;

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);
  const token = await hre.ethers.getContractAt("DDCToken", tokenAddr);

  const cb = await presale.currentBatch();
  const tge = await presale.tgeTimestamp();
  const pbal = await token.balanceOf(presaleAddr);
  const rbal = await token.balanceOf(rewardAddr);

  console.log("currentBatch:", cb.toString());
  console.log("tgeTimestamp:", tge.toString());
  console.log("presale token balance:", pbal.toString());
  console.log("reward token balance:", rbal.toString());
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
