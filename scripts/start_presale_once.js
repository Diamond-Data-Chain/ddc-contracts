const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.PRESALE;
  if (!presaleAddr) throw new Error("Missing PRESALE env");

  const delaySec = Number(process.env.START_DELAY_SEC || 60);
  const latest = await hre.ethers.provider.getBlock("latest");
  const startTime = Number(latest.timestamp) + delaySec;

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);

  console.log("Starting presale:");
  console.log("PRESALE:", presaleAddr);
  console.log("START_TIME:", startTime);

  const tx = await presale.startPresaleOnce(startTime);
  console.log("startPresaleOnce tx:", tx.hash);
  await tx.wait();

  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
