const hre = require("hardhat");

async function main() {
  console.log("=== VESTING CONSERVATION INVARIANT CHECK ===");

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

  const users = [buyer1, buyer2];

  for (let i = 0; i < users.length; i++) {
    const txid = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("buy-" + i)
    );

    await presale.connect(users[i]).buyWithUSDT(
      5000n * 1000000n,
      txid
    );
  }

  const latest2 =
    await hre.ethers.provider.getBlock("latest");

  const tge =
    Number(latest2.timestamp) + 100;

  await presale.setTGE(tge);

  await hre.network.provider.send(
    "evm_increaseTime",
    [120]
  );

  await hre.network.provider.send("evm_mine");

  for (const u of users) {
    const claimable =
      await presale.claimable(u.address);

    if (claimable > 0n) {
      try {
        await presale.connect(u).claim();
      } catch {}
    }
  }

  for (const u of users) {
    const principal =
      await presale.vestingPrincipal(u.address);

    const claimed =
      await presale.claimed(u.address);

    const claimable =
      await presale.claimable(u.address);

    const locked =
      await presale.locked(u.address);

    const total =
      claimed + claimable + locked;

    console.log("user:", u.address);
    console.log("principal:", principal.toString());
    console.log("claimed:", claimed.toString());
    console.log("claimable:", claimable.toString());
    console.log("locked:", locked.toString());
    console.log("total:", total.toString());

    if (total > principal) {
      throw new Error(
        "vesting conservation invariant violated"
      );
    }
  }

  console.log(
    "VESTING CONSERVATION INVARIANT CHECK PASSED"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
