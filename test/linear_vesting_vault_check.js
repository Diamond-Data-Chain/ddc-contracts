const hre = require("hardhat");

async function main() {
  console.log("=== LINEAR VESTING VAULT CHECK ===");

  const [owner, beneficiary, attacker] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("DDCToken");
  const Vault = await hre.ethers.getContractFactory("DDCLinearVestingVault");

  const ddc = await Token.deploy(owner.address);
  await ddc.waitForDeployment();

  const latest = await hre.ethers.provider.getBlock("latest");
  const start = Number(latest.timestamp) + 100;

  const allocation = hre.ethers.parseEther("32000000");
  const duration = 24 * 30 * 24 * 3600;

  const vault = await Vault.deploy(
    await ddc.getAddress(),
    beneficiary.address,
    start,
    duration,
    allocation
  );

  await vault.waitForDeployment();

  await ddc.transfer(await vault.getAddress(), allocation);

  let earlyBlocked = false;
  try {
    await vault.connect(beneficiary).claim();
  } catch {
    earlyBlocked = true;
  }

  let attackerBlocked = false;
  try {
    await vault.connect(attacker).claim();
  } catch {
    attackerBlocked = true;
  }

  await hre.network.provider.send("evm_increaseTime", [
    12 * 30 * 24 * 3600 + 120
  ]);
  await hre.network.provider.send("evm_mine");

  const claimable = await vault.claimable();
  await vault.connect(beneficiary).claim();

  const bal = await ddc.balanceOf(beneficiary.address);
  const claimed = await vault.claimed();

  console.log("earlyBlocked:", earlyBlocked);
  console.log("attackerBlocked:", attackerBlocked);
  console.log("claimable:", claimable.toString());
  console.log("beneficiaryBalance:", bal.toString());
  console.log("claimed:", claimed.toString());

  if (!earlyBlocked) throw new Error("early claim allowed");
  if (!attackerBlocked) throw new Error("attacker claim allowed");
  if (bal <= 0n) throw new Error("beneficiary did not receive DDC");
  if (claimed !== bal) throw new Error("claimed mismatch");

  console.log("LINEAR VESTING VAULT CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
