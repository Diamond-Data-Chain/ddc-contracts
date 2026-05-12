const hre = require("hardhat");

const PRESALE = process.env.PRESALE;
const RECORDER = process.env.RECORDER;
const USDT = process.env.USDT;

const TXS = (process.env.BUY_TXS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

if (!PRESALE) throw new Error("Missing PRESALE in .env");
if (!RECORDER) throw new Error("Missing RECORDER in .env");
if (!USDT) throw new Error("Missing USDT in .env");
if (TXS.length === 0) throw new Error("Missing BUY_TXS env");

const PROJECT_ID = hre.ethers.keccak256(
  hre.ethers.toUtf8Bytes("DDC_PROJECT_V1")
);

async function main() {
  console.log("=== RECORDER SYNC FROM TX HASHES ===");

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", PRESALE);
  const recorder = await hre.ethers.getContractAt("DDCPresaleRecorder", RECORDER);

  let synced = 0;
  let skipped = 0;

  for (const hash of TXS) {
    console.log("tx:", hash);

    const receipt = await hre.ethers.provider.getTransactionReceipt(hash);
    if (!receipt) {
      console.log("  missing receipt");
      skipped++;
      continue;
    }

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== PRESALE.toLowerCase()) continue;

      let parsed;
      try {
        parsed = presale.interface.parseLog(log);
      } catch {
        continue;
      }

      if (!parsed || parsed.name !== "Purchased") continue;

      const buyer = parsed.args[0];
      const batchId = parsed.args[1];
      const ddcAmount = parsed.args[2];
      const payAmount = parsed.args[3];
      const isUSDT = parsed.args[4];
      const txId = parsed.args[5];

      if (!isUSDT) {
        console.log("  skip non-USDT");
        skipped++;
        continue;
      }

      const sourceRef = hre.ethers.keccak256(
        hre.ethers.solidityPacked(
          ["bytes32", "bytes32", "uint256"],
          [txId, hash, BigInt(log.index)]
        )
      );

      const already = await recorder.recordedSourceRef(PROJECT_ID, sourceRef);
      if (already) {
        console.log("  already recorded");
        skipped++;
        continue;
      }

      console.log(
        "  sync buyer",
        buyer,
        "batch",
        batchId.toString(),
        "ddc",
        hre.ethers.formatEther(ddcAmount),
        "paid",
        hre.ethers.formatUnits(payAmount, 6),
        "USDT"
      );

      const tx = await recorder.recordPurchase(
        PROJECT_ID,
        buyer,
        ddcAmount,
        USDT,
        payAmount,
        1,
        hre.ethers.ZeroHash,
        sourceRef,
        0
      );

      await tx.wait();
      synced++;
    }
  }

  console.log("synced:", synced);
  console.log("skipped:", skipped);
  console.log("RECORDER TX HASH SYNC COMPLETE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
