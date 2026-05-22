const hre = require("hardhat");

const ERC20 = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function mint(address,uint256)",
];

async function tryMint(usdt, to, amount) {
  try {
    const tx = await usdt.mint(to, amount);
    await tx.wait();
    console.log("minted USDT to", to);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== STAGING AUTO SWEEP CHECK ===");

  const [deployer] = await hre.ethers.getSigners();

  const presaleAddr = process.env.PRESALE || process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  const usdtAddr = process.env.USDT || process.env.NEXT_PUBLIC_USDT_ADDRESS;
  const treasury = process.env.TREASURY;

  if (!presaleAddr || !usdtAddr || !treasury) {
    throw new Error("Missing PRESALE/USDT/TREASURY env");
  }

  const buyer2 = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);

  console.log("buyer1:", deployer.address);
  console.log("buyer2:", buyer2.address);

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);
  const usdt1 = await hre.ethers.getContractAt(ERC20, usdtAddr, deployer);
  const usdt2 = await hre.ethers.getContractAt(ERC20, usdtAddr, buyer2);

  await (await deployer.sendTransaction({
    to: buyer2.address,
    value: hre.ethers.parseEther("0.003"),
  })).wait();

  const buy1 = hre.ethers.parseUnits("4900", 6);
  const buy2 = hre.ethers.parseUnits("5000", 6);

  let bal1 = await usdt1.balanceOf(deployer.address);

  if (bal1 < buy1) {
    const ok = await tryMint(usdt1, deployer.address, buy1 - bal1);
    if (!ok) throw new Error("buyer1 lacks USDT and mint failed");
  }

  const ok2 = await tryMint(usdt1, buyer2.address, buy2);
  if (!ok2) {
    const balNow = await usdt1.balanceOf(deployer.address);
    if (balNow < buy1 + buy2) throw new Error("not enough USDT to fund buyer2 and mint failed");
    await (await usdt1.transfer(buyer2.address, buy2)).wait();
  }

  const beforePresale = await usdt1.balanceOf(presaleAddr);
  const beforeTreasury = await usdt1.balanceOf(treasury);

  console.log("presale USDT before:", hre.ethers.formatUnits(beforePresale, 6));
  console.log("treasury USDT before:", hre.ethers.formatUnits(beforeTreasury, 6));

  await (await usdt1.approve(presaleAddr, buy1)).wait();
  let tx = await presale.connect(deployer).buyWithUSDT(
    buy1,
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("staging-auto-sweep-4900"))
  );
  console.log("buy1 tx:", tx.hash);
  await tx.wait();

  await (await usdt2.approve(presaleAddr, buy2)).wait();
  tx = await presale.connect(buyer2).buyWithUSDT(
    buy2,
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("staging-auto-sweep-5000"))
  );
  console.log("buy2 tx:", tx.hash);
  await tx.wait();

  const afterPresale = await usdt1.balanceOf(presaleAddr);
  const afterTreasury = await usdt1.balanceOf(treasury);

  console.log("presale USDT after:", hre.ethers.formatUnits(afterPresale, 6));
  console.log("treasury USDT after:", hre.ethers.formatUnits(afterTreasury, 6));
  console.log("treasury delta:", hre.ethers.formatUnits(afterTreasury - beforeTreasury, 6));

  if (afterTreasury - beforeTreasury !== hre.ethers.parseUnits("10000", 6)) {
    throw new Error("treasury did not receive exact 10000 USDT chunk");
  }

  console.log("STAGING AUTO SWEEP CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
