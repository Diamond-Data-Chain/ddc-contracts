const hre = require("hardhat");

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  const [buyer] = await hre.ethers.getSigners();

  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  const usdtAddr = process.env.NEXT_PUBLIC_USDT_ADDRESS;

  if (!presaleAddr) throw new Error("Missing NEXT_PUBLIC_PRESALE_ADDRESS");
  if (!usdtAddr) throw new Error("Missing NEXT_PUBLIC_USDT_ADDRESS");

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr, buyer);
  const usdt = new hre.ethers.Contract(usdtAddr, USDT_ABI, buyer);

  const amount = 100n * 10n ** 6n;
  const txId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("prod-buy-100-usdt"));

  const bal = await usdt.balanceOf(buyer.address);
  console.log("buyer:", buyer.address);
  console.log("buyer usdt before:", bal.toString());

  if (bal < amount) {
    throw new Error("Buyer has insufficient USDT. Mint/fund buyer first.");
  }

  let tx = await usdt.approve(presaleAddr, amount);
  console.log("approve tx:", tx.hash);
  await tx.wait();

  tx = await presale.buyWithUSDT(amount, txId);
  console.log("buy tx:", tx.hash);
  await tx.wait();

  const totalPurchased = await presale.totalPurchased(buyer.address);
  const claimable = await presale.claimable(buyer.address);
  const claimed = await presale.claimed(buyer.address);
  const locked = await presale.locked(buyer.address);

  console.log("totalPurchased:", totalPurchased.toString());
  console.log("claimable:", claimable.toString());
  console.log("claimed:", claimed.toString());
  console.log("locked:", locked.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
