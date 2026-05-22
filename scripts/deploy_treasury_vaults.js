const hre = require("hardhat");

function mustAddr(name, value) {
  if (!value) throw new Error(`Missing ${name} in .env`);
  return hre.ethers.getAddress(value);
}

function mustUint(name, value) {
  if (!value) throw new Error(`Missing ${name} in .env`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return n;
}

async function main() {
  console.log("=== DEPLOY TREASURY VAULTS ===");

  const USDT = mustAddr("USDT", process.env.USDT || process.env.NEXT_PUBLIC_USDT_ADDRESS);
  const PRESALE = mustAddr("PRESALE", process.env.PRESALE || process.env.NEXT_PUBLIC_PRESALE_ADDRESS);

  const OPS_WALLET = mustAddr("OPS_WALLET", process.env.OPS_WALLET);
  const ADAMAS_WALLET = mustAddr("ADAMAS_WALLET", process.env.ADAMAS_WALLET);

  const PRESALE_START = mustUint("PRESALE_START", process.env.PRESALE_START);

  const Monthly = await hre.ethers.getContractFactory("DDCMonthlyOpsVault");
  const monthly = await Monthly.deploy(
    USDT,
    OPS_WALLET,
    PRESALE_START
  );
  await monthly.waitForDeployment();
  const monthlyAddr = await monthly.getAddress();

  const Adamas = await hre.ethers.getContractFactory("DDCAdamasGrantVault");
  const adamas = await Adamas.deploy(
    USDT,
    PRESALE,
    ADAMAS_WALLET
  );
  await adamas.waitForDeployment();
  const adamasAddr = await adamas.getAddress();

  console.log("MonthlyOpsVault:", monthlyAddr);
  console.log("AdamasGrantVault:", adamasAddr);

  console.log("\n=== FRONTEND ENV ===");
  console.log("NEXT_PUBLIC_MONTHLY_OPS_VAULT_ADDRESS=" + monthlyAddr);
  console.log("NEXT_PUBLIC_ADAMAS_GRANT_VAULT_ADDRESS=" + adamasAddr);

  console.log("\n=== CONTRACT ENV ===");
  console.log("MONTHLY_OPS_VAULT=" + monthlyAddr);
  console.log("ADAMAS_GRANT_VAULT=" + adamasAddr);

  console.log("\nDONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
