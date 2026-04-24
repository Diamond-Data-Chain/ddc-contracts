const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No signer");
  }
  const deployer = signers[0];

  const tokenAddr = process.env.NEXT_PUBLIC_DDC_TOKEN_ADDRESS;
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

  if (!tokenAddr || !presaleAddr) {
    throw new Error("Missing NEXT_PUBLIC_DDC_TOKEN_ADDRESS or NEXT_PUBLIC_PRESALE_ADDRESS in .env");
  }

  const token = await hre.ethers.getContractAt("DDCToken", tokenAddr, deployer);

  const totalToFund = hre.ethers.parseUnits("102400000", 18); // full presale nominal allocation
  const tx = await token.transfer(presaleAddr, totalToFund);
  console.log("fund tx:", tx.hash);
  await tx.wait();

  const presaleBal = await token.balanceOf(presaleAddr);
  console.log("presale DDC balance:", presaleBal.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
