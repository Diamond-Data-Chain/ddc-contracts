const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  const expected = process.env.TREASURY;

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);
  const treasury = await presale.treasury();

  console.log("presale:", presaleAddr);
  console.log("treasury in contract:", treasury);
  console.log("treasury in env:", expected);
  console.log("ok:", treasury.toLowerCase() === expected.toLowerCase());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
