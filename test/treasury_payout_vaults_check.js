const fs = require("fs");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== TREASURY PAYOUT VAULTS CHECK ===");

const monthly = fs.readFileSync(
  "contracts/treasury/DDCMonthlyOpsVault.sol",
  "utf8"
);

const adamas = fs.readFileSync(
  "contracts/treasury/DDCAdamasGrantVault.sol",
  "utf8"
);

must(
  "monthly amount exists",
  monthly.includes("168_000")
);

must(
  "max months exists",
  monthly.includes("MAX_MONTHS = 12")
);

must(
  "monthly delayed start exists",
  monthly.includes("30 days")
);

must(
  "monthly claim event exists",
  monthly.includes("event MonthlyClaim")
);

must(
  "monthly claim guard exists",
  monthly.includes("nothing claimable")
);

must(
  "adamas amount exists",
  adamas.includes("1_850_000")
);

must(
  "adamas finalize guard exists",
  adamas.includes("presale not finalized")
);

must(
  "single claim guard exists",
  adamas.includes("already claimed")
);

must(
  "grant claimed event exists",
  adamas.includes("event GrantClaimed")
);

console.log("TREASURY PAYOUT VAULTS CHECK PASSED");
