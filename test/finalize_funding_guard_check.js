const hre = require("hardhat");

async function main() {
  console.log("=== FINALIZE FUNDING GUARD CHECK ===");

  const [owner] = await hre.ethers.getSigners();

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

  const status =
    await presale.finalizeFundingStatus();

  console.log("buyerReserveRequired:",
    status[0].toString()
  );

  console.log("rewardPoolResidualRequired:",
    status[1].toString()
  );

  console.log("totalRequired:",
    status[2].toString()
  );

  console.log("actualBalance:",
    status[3].toString()
  );

  if (status[3] >= status[2]) {
    throw new Error(
      "guard test invalid: expected underfunded state"
    );
  }

  console.log(
    "FINALIZE FUNDING GUARD CHECK PASSED"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
