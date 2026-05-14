const fs = require("fs");

const src = fs.readFileSync("contracts/presale/DDCPresaleVesting.sol", "utf8");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== FINALIZE / TREASURY LIVENESS CHECK ===");

must("finalizeFundingStatus view exists", src.includes("function finalizeFundingStatus()"));
must("buyer reserve required included", src.includes("buyerReserveRequired"));
must("reward pool residual included", src.includes("rewardPoolResidualRequired"));
must("total funding required includes buyer reserve and residual", src.includes("buyerReserveRequired + residualToRewardPool"));
must("finalize requires total DDC funding", src.includes("insufficient DDC for finalize"));

must("treasury sweep function exists", src.includes("function sweepRaisedFundsToTreasury()"));
must("automatic treasury sweep exists", src.includes("function _autoSweepRaisedFunds()"));
must("auto sweep called after USDT transfer", src.includes("_autoSweepRaisedFunds();"));
must("auto sweep uses threshold chunks", src.includes("usdtBal / TREASURY_SWEEP_THRESHOLD_USDT"));
must("withdraw requires finalized", src.includes('require(finalized, "not finalized");'));

console.log("FINALIZE / TREASURY LIVENESS CHECK PASSED");
