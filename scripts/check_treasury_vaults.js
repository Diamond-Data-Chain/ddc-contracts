const hre = require("hardhat");

const ERC20 = [
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  console.log("=== TREASURY VAULT CHECK ===");

  const usdtAddr = process.env.USDT || process.env.NEXT_PUBLIC_USDT_ADDRESS;

  const monthlyAddr =
    process.env.MONTHLY_OPS_VAULT ||
    process.env.NEXT_PUBLIC_MONTHLY_OPS_VAULT_ADDRESS;

  const adamasAddr =
    process.env.ADAMAS_GRANT_VAULT ||
    process.env.NEXT_PUBLIC_ADAMAS_GRANT_VAULT_ADDRESS;

  if (!usdtAddr || !monthlyAddr || !adamasAddr) {
    throw new Error("Missing env addresses");
  }

  const monthly = await hre.ethers.getContractAt(
    "DDCMonthlyOpsVault",
    monthlyAddr
  );

  const adamas = await hre.ethers.getContractAt(
    "DDCAdamasGrantVault",
    adamasAddr
  );

  const usdt = await hre.ethers.getContractAt(
    ERC20,
    usdtAddr
  );

  console.log("MonthlyOpsVault:", monthlyAddr);
  console.log("AdamasGrantVault:", adamasAddr);

  console.log(
    "monthly claimed months:",
    (await monthly.claimedMonths()).toString()
  );

  console.log(
    "monthly startTime:",
    (await monthly.startTime()).toString()
  );

  console.log(
    "monthly balance:",
    hre.ethers.formatUnits(
      await usdt.balanceOf(monthlyAddr),
      18
    )
  );

  console.log(
    "adamas claimed:",
    await adamas.claimed()
  );

  console.log(
    "adamas balance:",
    hre.ethers.formatUnits(
      await usdt.balanceOf(adamasAddr),
      18
    )
  );

  console.log("TREASURY VAULT CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
