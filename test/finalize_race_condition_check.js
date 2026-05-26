const hre = require("hardhat");

async function main() {
  console.log("=== FINALIZE RACE CONDITION CHECK ===");

  const [owner, buyer1, buyer2] =
    await hre.ethers.getSigners();

  const Token =
    await hre.ethers.getContractFactory("DDCToken");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  const usdt = await Token.deploy(owner.address);
  await usdt.waitForDeployment();

  const Reward =
    await hre.ethers.getContractFactory("DDCRewardPool");

  const reward = await Reward.deploy(
    owner.address,
    await ddc.getAddress()
  );

  await reward.waitForDeployment();

  const latest =
    await hre.ethers.provider.getBlock("latest");

  const start = Number(latest.timestamp) + 1;

  const prices = [
    10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,
    15000,15500,16000,16500,17000,17500,18000,18500,19000,19500,
    20000,20500,21000,21500,22000,22500,23000,23500,24000,24500,
    25000,25500,26000,26500,27000,27500,28000,28500,29000,29500
  ];

  const Presale =
    await hre.ethers.getContractFactory(
      "DDCPresaleVesting"
    );

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

  await reward.setPresaleOnce(
    await presale.getAddress()
  );

  const nominal =
    await presale.PRESALE_NOMINAL_TOTAL();

  await ddc.transfer(
    await presale.getAddress(),
    nominal
  );

  for (const u of [buyer1, buyer2]) {
    await usdt.transfer(
      u.address,
      hre.ethers.parseUnits("100000", 18)
    );

    await usdt.connect(u).approve(
      await presale.getAddress(),
      hre.ethers.MaxUint256
    );
  }

  const txid1 = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("race-buy-1")
  );

  await presale.connect(buyer1).buyWithUSDT(
    5000n * 1000000n,
    txid1
  );

  for (let i = 0; i < 40; i++) {
    await hre.network.provider.send(
      "evm_increaseTime",
      [368640]
    );

    await hre.network.provider.send("evm_mine");

    try {
      await presale.advanceIfEnded();
    } catch {}

    try {
      await presale.finalize();
    } catch {}
  }

  const finalized = await presale.finalized();

  console.log("finalized:", finalized);

  if (!finalized) {
    throw new Error("finalize never succeeded");
  }

  let buyBlocked = false;

  try {
    const txid2 = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("race-buy-2")
    );

    await presale.connect(buyer2).buyWithUSDT(
      5000n * 1000000n,
      txid2
    );
  } catch {
    buyBlocked = true;
  }

  console.log("buy blocked after finalize:", buyBlocked);

  if (!buyBlocked) {
    throw new Error("buy succeeded after finalize");
  }

  let finalizeReplayBlocked = false;

  try {
    await presale.finalize();
  } catch {
    finalizeReplayBlocked = true;
  }

  console.log(
    "finalize replay blocked:",
    finalizeReplayBlocked
  );

  if (!finalizeReplayBlocked) {
    throw new Error("finalize replay allowed");
  }

  const rewardBal = await ddc.balanceOf(
    await reward.getAddress()
  );

  console.log(
    "reward balance:",
    rewardBal.toString()
  );

  if (rewardBal <= 0n) {
    throw new Error("reward pool empty");
  }

  console.log(
    "FINALIZE RACE CONDITION CHECK PASSED"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
