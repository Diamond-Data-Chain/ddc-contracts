const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("DDCToken");
  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  const usdt = await Token.deploy(owner.address);
  await usdt.waitForDeployment();

  const Reward = await hre.ethers.getContractFactory("DDCRewardPool");
  const reward = await Reward.deploy(owner.address, await ddc.getAddress());
  await reward.waitForDeployment();

  const latest = await hre.ethers.provider.getBlock("latest");

  const prices = [
    10000,30000,50000,70000,90000,110000,130000,150000,170000,190000,
    210000,230000,250000,270000,290000,310000,330000,350000,370000,390000,
    410000,430000,450000,470000,490000,510000,530000,550000,570000,590000,
    610000,630000,650000,670000,690000,710000,730000,750000,770000,790000
  ];

  const Presale = await hre.ethers.getContractFactory("DDCPresaleVesting");
  const presale = await Presale.deploy(
    owner.address,
    await ddc.getAddress(),
    await usdt.getAddress(),
    await reward.getAddress(),
    owner.address,
    latest.timestamp + 1,
    prices
  );
  await presale.waitForDeployment();

  const expected = [10000n, 30000n, 50000n, 70000n, 90000n];

  for (let i = 1; i <= 5; i++) {
    const info = await presale.batchInfo(i);
    const price = info[0];

    console.log(`Batch ${i} price:`, price.toString());

    if (price !== expected[i - 1]) {
      throw new Error(`Wrong price for batch ${i}`);
    }

    if (i < 5) {
      await hre.network.provider.send("evm_increaseTime", [368640 + 10]);
      await hre.network.provider.send("evm_mine");
      await presale.advanceIfEnded();
    }
  }

  console.log("PRICE CURVE 1-5 CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
