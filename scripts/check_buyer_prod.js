const hre = require("hardhat");

async function main() {
  const [buyer] = await hre.ethers.getSigners();
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);

  const totalPurchased = await presale.totalPurchased(buyer.address);
  const principal = await presale.vestingPrincipal(buyer.address);
  const claimable = await presale.claimable(buyer.address);
  const claimed = await presale.claimed(buyer.address);
  const locked = await presale.locked(buyer.address);

  console.log("buyer:", buyer.address);
  console.log("totalPurchased:", totalPurchased.toString());
  console.log("vestingPrincipal:", principal.toString());
  console.log("claimable:", claimable.toString());
  console.log("claimed:", claimed.toString());
  console.log("locked:", locked.toString());
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
