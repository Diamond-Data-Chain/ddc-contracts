const hre = require("hardhat");

async function main() {
  console.log("=== PAUSE EXECUTION CHECK ===");

  const [owner, buyer] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("DDCToken");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

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

  await ddc.transfer(await presale.getAddress(), await presale.PRESALE_NOMINAL_TOTAL());

  await usdt.transfer(buyer.address, hre.ethers.parseUnits("1000", 6));
  await usdt.connect(buyer).approve(await presale.getAddress(), hre.ethers.parseUnits("1000", 6));

  await hre.network.provider.send("evm_increaseTime", [5]);
  await hre.network.provider.send("evm_mine");

  await presale.pause();

  let buyBlocked = false;
  try {
    await presale.connect(buyer).buyWithUSDT(
      hre.ethers.parseUnits("100", 6),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("paused-buy"))
    );
  } catch {
    buyBlocked = true;
  }

  console.log("buy blocked while paused:", buyBlocked);

  await presale.unpause();

  await (
    await presale.connect(buyer).buyWithUSDT(
      hre.ethers.parseUnits("100", 6),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("unpaused-buy"))
    )
  ).wait();

  const purchased = await presale.totalPurchased(buyer.address);

  console.log("purchased after unpause:", purchased.toString());

  if (!buyBlocked) throw new Error("buy was not blocked while paused");
  if (purchased <= 0n) throw new Error("buy did not work after unpause");

  console.log("PAUSE EXECUTION CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
