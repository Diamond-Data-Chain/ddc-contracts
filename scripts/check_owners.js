const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.PRESALE;
  const rewardAddr = process.env.REWARD_POOL || process.env.REWARD;
  const recorderAddr = process.env.RECORDER;

  if (!presaleAddr) throw new Error("Missing PRESALE");
  if (!rewardAddr) throw new Error("Missing REWARD_POOL or REWARD");
  if (!recorderAddr) throw new Error("Missing RECORDER");

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);
  const reward = await hre.ethers.getContractAt("DDCRewardPool", rewardAddr);
  const recorder = await hre.ethers.getContractAt("DDCPresaleRecorder", recorderAddr);

  console.log("Presale:", presaleAddr);
  console.log("Presale owner:", await presale.owner());

  console.log("RewardPool:", rewardAddr);
  console.log("RewardPool owner:", await reward.owner());

  console.log("Recorder:", recorderAddr);
  console.log("Recorder owner:", await recorder.owner());
  console.log("Recorder writer:", await recorder.writer());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
