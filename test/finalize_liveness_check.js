const fs = require("fs");

const src = fs.readFileSync("contracts/presale/DDCPresaleVesting.sol", "utf8");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== FINALIZE / TREASURY LIVENESS CHECK ===");

must("finalizeFundingStatus view exists", src.includes("function finalizeFundingStatus()"));
must("buyer reserve required included", src.includes("buyerReserveRequired = totalBuyerPrincipal - totalClaimed"));
must("reward pool residual included", src.includes("rewardPoolResidualRequired = PRESALE_NOMINAL_TOTAL - totalBuyerPrincipal"));
must("total funding required includes buyer reserve and residual", src.includes("totalRequired = buyerReserveRequired + residualToRewardPool"));
must("finalize requires total DDC funding", src.includes('require(\n            ddc.balanceOf(address(this)) >= totalRequired'));
must("finalize has clear insufficient funding error", src.includes('"insufficient DDC for finalize"'));
must("treasury sweep requires finalized", src.includes('function sweepRaisedFundsToTreasury() external nonReentrant {\n        require(finalized, "not finalized");'));
must("withdraw requires finalized", src.includes('require(finalized, "not finalized")'));

console.log("FINALIZE / TREASURY LIVENESS CHECK PASSED");
