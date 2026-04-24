const hre = require("hardhat");

async function main() {
  const rewardAddr = process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS;
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

  if (!rewardAddr) throw new Error("Missing NEXT_PUBLIC_REWARD_POOL_ADDRESS");
  if (!presaleAddr) throw new Error("Missing NEXT_PUBLIC_PRESALE_ADDRESS");

  const reward = await hre.ethers.getContractAt("DDCRewardPool", rewardAddr);
  const linked = await reward.presale();

  console.log("reward:", rewardAddr);
  console.log("linked presale:", linked);
  console.log("expected presale:", presaleAddr);
  console.log("ok:", linked.toLowerCase() === presaleAddr.toLowerCase());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
