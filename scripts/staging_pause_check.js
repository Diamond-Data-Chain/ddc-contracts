const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.PRESALE || process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  if (!presaleAddr) throw new Error("Missing PRESALE");

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);

  console.log("Presale:", presaleAddr);

  let tx = await presale.pause();
  console.log("pause tx:", tx.hash);
  await tx.wait();

  tx = await presale.unpause();
  console.log("unpause tx:", tx.hash);
  await tx.wait();

  console.log("STAGING PAUSE CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
