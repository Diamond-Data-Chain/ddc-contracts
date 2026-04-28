const fs = require("fs");

const src = fs.readFileSync("contracts/presale/DDCPresaleVesting.sol", "utf8");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== BATCH ROLLOVER / TIMING CHECK ===");

must("sync batches exists", src.includes("function _syncBatches()"));
must("effective current batch helper exists", src.includes("function _effectiveCurrentBatchId()"));
must("batch duration fixed", src.includes("BATCH_DURATION"));
must("sold-out condition exists", src.includes("b.sold >= b.hardCap"));
must("time-expiry condition exists", src.includes("block.timestamp"));
must(
  "unsold rollover calculated",
  src.includes("hardCap -") && src.includes("sold")
);
must("rollover added to next batch", src.includes("n.rolloverIn += unsold"));
must("next hardCap increased by rollover", src.includes("n.hardCap += unsold"));
must("next price assigned from fixed price table", src.includes("n.priceUSDT = _prices[nextId - 1]"));
must("batch id cannot exceed total", src.includes("currentBatchId <= TOTAL_BATCHES"));

console.log("BATCH ROLLOVER / TIMING CHECK PASSED");
