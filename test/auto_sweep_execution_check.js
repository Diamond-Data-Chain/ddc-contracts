const hre = require("hardhat");

async function main() {
  console.log("=== AUTO SWEEP EXECUTION CHECK ===");

  const [owner, buyer1, buyer2, treasury] = await hre.ethers.getSigners();

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
    treasury.address,
    start,
    prices
  );

  await presale.waitForDeployment();
  await reward.setPresaleOnce(await presale.getAddress());

  await ddc.transfer(
    await presale.getAddress(),
    await presale.PRESALE_NOMINAL_TOTAL()
  );

  for (const buyer of [buyer1, buyer2]) {
    await usdt.transfer(buyer.address, hre.ethers.parseUnits("5000", 6));
    await usdt.connect(buyer).approve(
      await presale.getAddress(),
      hre.ethers.parseUnits("5000", 6)
    );
  }

  await hre.network.provider.send("evm_increaseTime", [5]);
  await hre.network.provider.send("evm_mine");

  await (
    await presale.connect(buyer1).buyWithUSDT(
      hre.ethers.parseUnits("5000", 6),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("sweep-buy-1"))
    )
  ).wait();

  let presaleBal = await usdt.balanceOf(await presale.getAddress());
  let treasuryBal = await usdt.balanceOf(treasury.address);

  console.log("after 5000 presale:", presaleBal.toString());
  console.log("after 5000 treasury:", treasuryBal.toString());

  if (presaleBal !== hre.ethers.parseUnits("5000", 6)) {
    throw new Error("presale should hold first 5000 USDT");
  }

  if (treasuryBal !== 0n) {
    throw new Error("treasury should not receive before threshold");
  }

  await (
    await presale.connect(buyer2).buyWithUSDT(
      hre.ethers.parseUnits("5000", 6),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("sweep-buy-2"))
    )
  ).wait();

  presaleBal = await usdt.balanceOf(await presale.getAddress());
  treasuryBal = await usdt.balanceOf(treasury.address);

  console.log("after 10000 presale:", presaleBal.toString());
  console.log("after 10000 treasury:", treasuryBal.toString());

  if (presaleBal !== 0n) {
    throw new Error("presale buffer should sweep exact 10000 USDT chunk");
  }

  if (treasuryBal !== hre.ethers.parseUnits("10000", 6)) {
    throw new Error("treasury should receive exact 10000 USDT");
  }

  console.log("AUTO SWEEP EXECUTION CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
