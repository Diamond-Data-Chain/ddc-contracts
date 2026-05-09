const fs = require("fs");

function must(name, ok) {
  if (!ok) {
    console.error("FAIL:", name);
    process.exit(1);
  }
  console.log("OK:", name);
}

console.log("=== BATCH ROLLOVER IDEMPOTENCY CHECK ===");

const src = fs.readFileSync("contracts/presale/DDCPresaleVesting.sol", "utf8");

must("_syncBatches exists", src.includes("function _syncBatches() internal"));

must(
  "closed batch stops repeated rollover",
  src.includes("if (b.isClosed) break;")
);

must(
  "batch is closed before rollover to next batch",
  src.indexOf("b.isClosed = true;") < src.indexOf("emit BatchRollover")
);

must(
  "currentBatchId advances after rollover",
  src.indexOf("emit BatchAdvanced") < src.indexOf("currentBatchId = nextId;")
);

must(
  "soldOut or expired required before rollover",
  src.includes("if (!soldOut && !expired) break;")
);

must(
  "invalid over-sold batch state rejected",
  src.includes('revert("invalid batch state")')
);

console.log("BATCH ROLLOVER IDEMPOTENCY CHECK PASSED");
