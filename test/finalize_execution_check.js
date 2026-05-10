const hre = require("hardhat");

async function main() {
  console.log("=== FINALIZE EXECUTION CHECK ===");

  const [owner] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("DDCToken");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  // Dummy ERC20 used only as USDT address for finalize-path test.
  const usdt = await Token.deploy(owner.address);
  await usdt.waitForDeployment();

  const Reward = await hre.ethers.getContractFactory("DDCRewardPool");
  const reward = await Reward.deploy(owner.address, await ddc.getAddress());
  await reward.waitForDeployment();

  const latest = await hre.ethers.provider.getBlock("latest");
  const start = Number(latest.timestamp) + 1;

  const prices = [
    10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,
    15000,15500,16000,16500,17000,17500,18000,18500,19000,19500,
    20000,20500,21000,21500,22000,22500,23000,23500,24000,24500,
    25000,25500,26000,26500,27000,27500,28000,28500,29000,29500
  ];

  const Presale = await hre.ethers.getContractFactory("DDCPresaleVesting");

  const presale = await Presale.deploy(
    owner.address,
    await ddc.getAddress(),
    await usdt.getAddress(),
    await reward.getAddress(),
    owner.address,
    start,
    prices
  );

  await presale.waitForDeployment();
  await reward.setPresaleOnce(await presale.getAddress());

  const nominal = await presale.PRESALE_NOMINAL_TOTAL();
  await ddc.transfer(await presale.getAddress(), nominal);

  for (let i = 0; i < 40; i++) {
    await hre.network.provider.send("evm_increaseTime", [103 * 3600]);
    await hre.network.provider.send("evm_mine");

    try {
      await presale.finalize();
    } catch {}
  }

  const currentBatch = await presale.currentBatch();
  console.log("currentBatch:", currentBatch.toString());

  let finalized = await presale.finalized();
  if (!finalized) {
    await presale.finalize();
    finalized = await presale.finalized();
  }

  const rewardBal = await ddc.balanceOf(await reward.getAddress());

  console.log("finalized:", finalized);
  console.log("reward balance:", rewardBal.toString());

  let replayBlocked = false;
  try {
    await presale.finalize();
  } catch {
    replayBlocked = true;
  }

  console.log("replay blocked:", replayBlocked);

  if (!finalized) throw new Error("finalize failed");
  if (!replayBlocked) throw new Error("finalize replay not blocked");
  if (rewardBal <= 0n) throw new Error("reward pool did not receive residual");

  console.log("FINALIZE EXECUTION CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
