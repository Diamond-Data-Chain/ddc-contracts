const fs = require("fs");

const src = fs.readFileSync("contracts/presale/DDCPresaleVesting.sol", "utf8");
const iface = fs.readFileSync("contracts/interfaces/IDDCPresaleVesting.sol", "utf8");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== PRESALE RULES STATIC CHECK ===");

must("USDT-only: no buyWithNative in contract", !src.includes("buyWithNative"));
must("USDT-only: no buyWithNative in interface", !iface.includes("buyWithNative"));
must("USDT-only: no native price field", !src.includes("nativePriceUsd6PerBNB"));
must("USDT-only: no native receive payable", !src.includes("receive() external payable"));
must("txId storage exists", src.includes("_usedTxIds"));
must("txId zero rejected", src.includes('require(txId != bytes32(0), "txId required")'));
must("txId replay rejected", src.includes('require(!_usedTxIds[txId], "txId used")'));

must("min purchase exists", src.includes("MIN_PURCHASE_USDT"));
must("max purchase exists", src.includes("MAX_PURCHASE_USDT"));
must("50 USDT min", src.includes("50 * 1e6"));
must("5000 USDT max", src.includes("5_000 * 1e6"));

must("40 batches", src.includes("TOTAL_BATCHES = 40"));
must("batch allocation exists", src.includes("BATCH_BASE_ALLOCATION"));
must("rollover field exists", src.includes("rolloverIn"));
must("hardCap check exists", src.includes("b.sold + ddcAmount <= b.hardCap"));

must("TGE set once", src.includes('require(tgeTimestamp == 0, "TGE already set")'));
must("claimable subtracts claimed", src.includes("unlocked > alreadyClaimed ? unlocked - alreadyClaimed : 0"));
must("claim requires claimable > 0", src.includes("require(amt > 0"));

must("claimed updated before transfer", src.indexOf("claimed[msg.sender] += amt") < src.indexOf("ddc.safeTransfer(msg.sender, amt)"));

must("finalize guarded once", src.includes('require(!finalized, "already finalized")'));
must("sweep threshold exists", src.includes("TREASURY_SWEEP_THRESHOLD_USDT"));
must("withdraw treasury only", src.includes('require(msg.sender == treasury, "not treasury")'));

console.log("PRESALE RULES CHECK PASSED");
