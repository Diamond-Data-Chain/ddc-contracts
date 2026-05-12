const hre = require("hardhat");

const PRESALE = process.env.PRESALE;
const RECORDER = process.env.RECORDER;
const USDT = process.env.USDT;

if (!PRESALE) throw new Error("Missing PRESALE in .env");
if (!RECORDER) throw new Error("Missing RECORDER in .env");
if (!USDT) throw new Error("Missing USDT in .env");

const PROJECT_ID = hre.ethers.keccak256(
  hre.ethers.toUtf8Bytes(process.env.PROJECT_KEY || "DDC_PROJECT_V1")
);

const POLL_MS = Number(process.env.RELAYER_POLL_MS || 5000);

async function recordParsed(recorder, parsed, log) {
  const buyer = parsed.args[0];
  const batchId = parsed.args[1];
  const ddcAmount = parsed.args[2];
  const payAmount = parsed.args[3];
  const isUSDT = parsed.args[4];
  const txId = parsed.args[5];

  if (!isUSDT) return;

  const sourceRef = hre.ethers.keccak256(
    hre.ethers.solidityPacked(
      ["bytes32", "bytes32", "uint256"],
      [txId, log.transactionHash, BigInt(log.index)]
    )
  );

  const already = await recorder.recordedSourceRef(PROJECT_ID, sourceRef);
  if (already) {
    console.log("already recorded:", log.transactionHash);
    return;
  }

  console.log(
    "recording:",
    buyer,
    "batch",
    batchId.toString(),
    "ddc",
    hre.ethers.formatEther(ddcAmount),
    "usdt",
    hre.ethers.formatUnits(payAmount, 6),
    "tx",
    log.transactionHash
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

  console.log("recorder tx:", tx.hash);
  await tx.wait();
  console.log("recorded:", log.transactionHash);
}

async function main() {
  console.log("=== DDC RECORDER RELAYER POLLER ===");
  console.log("PRESALE:", PRESALE);
  console.log("RECORDER:", RECORDER);
  console.log("USDT:", USDT);
  console.log("PROJECT_ID:", PROJECT_ID);

  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", PRESALE);
  const recorder = await hre.ethers.getContractAt("DDCPresaleRecorder", RECORDER);

  let last = await hre.ethers.provider.getBlockNumber();

  console.log("starting from block:", last);
  console.log("poll ms:", POLL_MS);

  while (true) {
    try {
      const latest = await hre.ethers.provider.getBlockNumber();

      for (let b = last + 1; b <= latest; b++) {
        const logs = await hre.ethers.provider.getLogs({
          address: PRESALE,
          fromBlock: b,
          toBlock: b,
        });

        for (const log of logs) {
          let parsed;
          try {
            parsed = presale.interface.parseLog(log);
          } catch {
            continue;
          }

          if (parsed?.name === "Purchased") {
            await recordParsed(recorder, parsed, log);
          }
        }

        last = b;
      }
    } catch (e) {
      console.error("poll error:", e?.shortMessage || e?.message || e);
    }

    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
