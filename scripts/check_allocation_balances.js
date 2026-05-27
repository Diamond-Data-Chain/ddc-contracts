require("dotenv").config();

const hre = require("hardhat");

function mustAddr(name, value) {
  if (!value) throw new Error(`Missing ${name}`);
  return hre.ethers.getAddress(value);
}

async function main() {
  console.log("=== DDC ALLOCATION BALANCE CHECK ===");

  const DDC = mustAddr("DDC", process.env.DDC);
  const PRESALE = mustAddr("PRESALE", process.env.PRESALE);
  const REWARD_POOL = mustAddr("REWARD_POOL", process.env.REWARD_POOL);
  const TREASURY = mustAddr("TREASURY", process.env.TREASURY);
  const TEAM_VAULT = mustAddr("TEAM_VAULT", process.env.TEAM_VAULT);
  const ADVISORS_VAULT = mustAddr("ADVISORS_VAULT", process.env.ADVISORS_VAULT);

  const ddc = await hre.ethers.getContractAt("DDCToken", DDC);

  const expected = {
    presale: hre.ethers.parseEther("102400000"),
    rewardPool: hre.ethers.parseEther("51200000"),
    foundation: hre.ethers.parseEther("38400000"),
    treasury: hre.ethers.parseEther("19200000"),
    teamVault: hre.ethers.parseEther("32000000"),
    advisorsVault: hre.ethers.parseEther("12800000"),
  };

  const balances = {
    presale: await ddc.balanceOf(PRESALE),
    rewardPool: await ddc.balanceOf(REWARD_POOL),
    treasuryCombined: await ddc.balanceOf(TREASURY),
    teamVault: await ddc.balanceOf(TEAM_VAULT),
    advisorsVault: await ddc.balanceOf(ADVISORS_VAULT),
  };

  const expectedTreasuryCombined =
    expected.foundation + expected.treasury;

  const totalChecked =
    balances.presale +
    balances.rewardPool +
    balances.treasuryCombined +
    balances.teamVault +
    balances.advisorsVault;

  const totalSupply = await ddc.totalSupply();

  console.log("DDC:", DDC);
  console.log("Presale:", PRESALE, balances.presale.toString());
  console.log("RewardPool:", REWARD_POOL, balances.rewardPool.toString());
  console.log("Treasury/Foundation Safe:", TREASURY, balances.treasuryCombined.toString());
  console.log("TeamVault:", TEAM_VAULT, balances.teamVault.toString());
  console.log("AdvisorsVault:", ADVISORS_VAULT, balances.advisorsVault.toString());

  console.log("Total checked:", totalChecked.toString());
  console.log("Total supply:", totalSupply.toString());

  if (balances.presale !== expected.presale) {
    throw new Error("Presale allocation mismatch");
  }

  if (balances.rewardPool !== expected.rewardPool) {
    throw new Error("RewardPool allocation mismatch");
  }

  if (balances.treasuryCombined !== expectedTreasuryCombined) {
    throw new Error("Treasury/Foundation combined allocation mismatch");
  }

  if (balances.teamVault !== expected.teamVault) {
    throw new Error("TeamVault allocation mismatch");
  }

  if (balances.advisorsVault !== expected.advisorsVault) {
    throw new Error("AdvisorsVault allocation mismatch");
  }

  if (totalChecked !== totalSupply) {
    throw new Error("Total checked allocation does not equal total supply");
  }

  console.log("ALLOCATION BALANCE CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
