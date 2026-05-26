const hre = require("hardhat");

async function main() {
  console.log("=== TIMELOCK EXECUTION CHECK ===");

  const [owner, newOwner] = await hre.ethers.getSigners();

  const Reward = await hre.ethers.getContractFactory("DDCRewardPool");
  const Token = await hre.ethers.getContractFactory("DDCToken");
  const Timelock = await hre.ethers.getContractFactory("DDCTimelock");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  const reward = await Reward.deploy(owner.address, await ddc.getAddress());
  await reward.waitForDeployment();

  const timelock = await Timelock.deploy(owner.address);
  await timelock.waitForDeployment();

  await reward.transferOwnership(await timelock.getAddress());

  const data = reward.interface.encodeFunctionData("transferOwnership", [
    newOwner.address
  ]);

  await timelock.queue(await reward.getAddress(), 0, data);

  let earlyBlocked = false;
  try {
    await timelock.execute(1);
  } catch {
    earlyBlocked = true;
  }

  await hre.network.provider.send("evm_increaseTime", [24 * 3600 + 1]);
  await hre.network.provider.send("evm_mine");

  await timelock.execute(1);

  const finalOwner = await reward.owner();

  console.log("earlyBlocked:", earlyBlocked);
  console.log("finalOwner:", finalOwner);

  if (!earlyBlocked) throw new Error("timelock allowed early execution");
  if (finalOwner !== newOwner.address) throw new Error("timelock execution failed");

  console.log("TIMELOCK EXECUTION CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
