const hre = require("hardhat");

async function main() {
  console.log("=== OWNERSHIP TRANSFER CHECK ===");

  const [owner, multisig, buyer, stranger] = await hre.ethers.getSigners();

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

  await presale.transferOwnership(multisig.address);

  const newOwner = await presale.owner();
  console.log("new owner:", newOwner);

  let oldOwnerBlocked = false;
  try {
    await presale.pause();
  } catch {
    oldOwnerBlocked = true;
  }

  console.log("old owner blocked:", oldOwnerBlocked);

  await presale.connect(multisig).pause();
  const pausedAfterMultisig = await presale.paused();

  console.log("multisig can pause:", pausedAfterMultisig);

  let strangerBlocked = false;
  try {
    await presale.connect(stranger).unpause();
  } catch {
    strangerBlocked = true;
  }

  console.log("stranger blocked:", strangerBlocked);

  await presale.connect(multisig).unpause();
  const pausedAfterUnpause = await presale.paused();

  console.log("multisig can unpause:", !pausedAfterUnpause);

  if (newOwner !== multisig.address) throw new Error("ownership not transferred");
  if (!oldOwnerBlocked) throw new Error("old owner still has owner privileges");
  if (!pausedAfterMultisig) throw new Error("new owner cannot pause");
  if (!strangerBlocked) throw new Error("stranger can unpause");
  if (pausedAfterUnpause) throw new Error("new owner cannot unpause");

  console.log("OWNERSHIP TRANSFER CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
