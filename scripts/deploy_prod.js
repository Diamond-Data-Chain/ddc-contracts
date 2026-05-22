const hre = require("hardhat");

function mustAddr(name, value) {
  if (!value) throw new Error(`Missing ${name} in .env`);
  try {
    return hre.ethers.getAddress(value);
  } catch {
    throw new Error(`Invalid ${name} in .env: ${value}`);
  }
}

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No deployer signer available. Check DEPLOYER_PRIVATE_KEY.");
  }

  const deployer = signers[0];
  console.log("Deploying with:", deployer.address);

  const TREASURY = mustAddr("TREASURY", process.env.TREASURY);
  const USDT = mustAddr("USDT", process.env.USDT);

  const latest = await hre.ethers.provider.getBlock("latest");
  const PRESALE_START = Number(latest.timestamp) - 60;

  const prices = [
    10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,
    15000,15500,16000,16500,17000,17500,18000,18500,19000,19500,
    20000,20500,21000,21500,22000,22500,23000,23500,24000,24500,
    25000,25500,26000,26500,27000,27500,28000,28500,29000,29500
  ];

  const Token = await hre.ethers.getContractFactory("DDCToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("DDC:", tokenAddr);

  const Reward = await hre.ethers.getContractFactory("DDCRewardPool");
  const reward = await Reward.deploy(
    deployer.address,
    tokenAddr
  );
  await reward.waitForDeployment();
  const rewardAddr = await reward.getAddress();
  console.log("RewardPool:", rewardAddr);

  const Presale = await hre.ethers.getContractFactory("DDCPresaleVesting");
  const presale = await Presale.deploy(
    deployer.address,
    tokenAddr,
    USDT,
    rewardAddr,
    TREASURY,
    PRESALE_START,
    prices
  );
  await presale.waitForDeployment();
  const presaleAddr = await presale.getAddress();
  console.log("Presale:", presaleAddr);

  const setPresaleTx = await reward.setPresaleOnce(presaleAddr);
  console.log("RewardPool setPresaleOnce tx:", setPresaleTx.hash);
  await setPresaleTx.wait();

  const fundAmount = await presale.PRESALE_NOMINAL_TOTAL();
  const fundTx = await token.transfer(presaleAddr, fundAmount);
  console.log("Fund Presale DDC tx:", fundTx.hash);
  await fundTx.wait();

  const Recorder = await hre.ethers.getContractFactory("DDCPresaleRecorder");
  const recorder = await Recorder.deploy(deployer.address, deployer.address);
  await recorder.waitForDeployment();
  const recorderAddr = await recorder.getAddress();
  console.log("Recorder:", recorderAddr);

  console.log("\n=== FRONTEND ENV ===");
  console.log("NEXT_PUBLIC_CHAIN_ID=" + hre.network.config.chainId);
  console.log("NEXT_PUBLIC_PRESALE_ADDRESS=" + presaleAddr);
  console.log("NEXT_PUBLIC_USDT_ADDRESS=" + USDT);
  console.log("NEXT_PUBLIC_REWARD_POOL_ADDRESS=" + rewardAddr);
  console.log("NEXT_PUBLIC_RECORDER_ADDRESS=" + recorderAddr);
  console.log("NEXT_PUBLIC_DDC_TOKEN_ADDRESS=" + tokenAddr);
  console.log("NEXT_PUBLIC_TREASURY_ADDRESS=" + TREASURY);
  console.log("NEXT_PUBLIC_PROJECT_KEY=DDC_PROJECT_V1");

  console.log("\n=== CONTRACT ENV ===");
  console.log("PRESALE=" + presaleAddr);
  console.log("REWARD_POOL=" + rewardAddr);
  console.log("RECORDER=" + recorderAddr);
  console.log("DDC=" + tokenAddr);
  console.log("USDT=" + USDT);
  console.log("TREASURY=" + TREASURY);

  console.log("\nDONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
