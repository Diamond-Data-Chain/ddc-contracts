const hre = require("hardhat");

const PRESALE = process.env.PRESALE;
const RECORDER = process.env.RECORDER;
const USDT = process.env.USDT;
const FROM_BLOCK = Number(process.env.PRESALE_DEPLOY_BLOCK || 0);
const CHUNK = Number(process.env.SYNC_CHUNK || 5000);

if (!PRESALE) throw new Error("Missing PRESALE in .env");
if (!RECORDER) throw new Error("Missing RECORDER in .env");
if (!USDT) throw new Error("Missing USDT in .env");

const PROJECT_ID = hre.ethers.keccak256(
  hre.ethers.toUtf8Bytes("DDC_PROJECT_V1")
);

async function main() {
  console.log("=== RECORDER SYNC FROM PRESALE ===");

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", PRESALE);
  const recorder = await hre.ethers.getContractAt("DDCPresaleRecorder", RECORDER);

  const latest = await hre.ethers.provider.getBlockNumber();
  console.log("fromBlock:", FROM_BLOCK);
  console.log("latest:", latest);
  console.log("chunk:", CHUNK);

  let events = [];

  for (let from = FROM_BLOCK; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);
    const part = await presale.queryFilter(presale.filters.Purchased(), from, to);
    console.log(`logs ${from}-${to}:`, part.length);
    events.push(...part);
  }

  console.log("Purchased events total:", events.length);

  let synced = 0;
  let skipped = 0;

  for (const ev of events) {
    const args = ev.args;

    const buyer = args[0];
    const batchId = args[1];
    const ddcAmount = args[2];
    const payAmount = args[3];
    const isUSDT = args[4];
    const txId = args[5];

    if (!isUSDT) {
      skipped++;
      continue;
    }

    const sourceRef = hre.ethers.keccak256(
      hre.ethers.solidityPacked(
        ["bytes32", "bytes32", "uint256"],
        [txId, ev.transactionHash, BigInt(ev.logIndex)]
      )
    );

    const already = await recorder.recordedSourceRef(PROJECT_ID, sourceRef);
    if (already) {
      skipped++;
      continue;
    }

    console.log(
      "SYNC",
      buyer,
      "batch",
      batchId.toString(),
      "ddc",
      hre.ethers.formatEther(ddcAmount)
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

  console.log("synced:", synced);
  console.log("skipped:", skipped);
  console.log("RECORDER SYNC COMPLETE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
