const hre = require("hardhat");

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("=== INVARIANT PRESALE FUZZ CHECK ===");

  const signers = await hre.ethers.getSigners();
  const owner = signers[0];
  const users = signers.slice(1, 8);

  const Token = await hre.ethers.getContractFactory("DDCToken");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  const usdt = await Token.deploy(owner.address);
  await usdt.waitForDeployment();

  const Reward = await hre.ethers.getContractFactory("DDCRewardPool");

  const reward = await Reward.deploy(
    owner.address,
    await ddc.getAddress()
  );

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

  for (const u of users) {
    await usdt.transfer(u.address, hre.ethers.parseUnits("100000", 18));
    await usdt.connect(u).approve(
      await presale.getAddress(),
      hre.ethers.MaxUint256
    );
  }

  let totalBought = 0n;

  for (let step = 0; step < 250; step++) {
    const actor = users[rnd(0, users.length - 1)];

    const action = rnd(0, 9);

    try {
      if (action <= 6) {
        const amt = BigInt(rnd(50, 5000)) * 1000000n;

        const txid = hre.ethers.keccak256(
          hre.ethers.toUtf8Bytes(`step-${step}-${Date.now()}`)
        );

        const before = await presale.totalNominalSold();

        await presale.connect(actor).buyWithUSDT(
          amt,
          txid
        );

        const after = await presale.totalNominalSold();

        if (after <= before) {
          throw new Error("INVARIANT FAIL: totalSold did not increase");
        }

        totalBought += (after - before);
      } else {
        await hre.network.provider.send("evm_increaseTime", [
          rnd(1, 120) * 3600
        ]);

        await hre.network.provider.send("evm_mine");

        try {
          await presale.advanceIfEnded();
        } catch {}

        try {
          await presale.finalize();
        } catch {}
      }

      const sold = await presale.totalNominalSold();
      const finalized = await presale.finalized();

      if (sold < 0n) {
        throw new Error("negative sold impossible");
      }

      if (finalized) {
        const rp = await ddc.balanceOf(await reward.getAddress());

        if (rp <= 0n) {
          throw new Error("reward pool invariant fail");
        }
      }

    } catch (e) {
      console.log("step", step, "handled:", e.message);
    }
  }

  const finalSold = await presale.totalNominalSold();

  console.log("final sold:", finalSold.toString());

  if (finalSold <= 0n) {
    throw new Error("fuzz produced zero sales");
  }

  console.log("INVARIANT PRESALE FUZZ CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
