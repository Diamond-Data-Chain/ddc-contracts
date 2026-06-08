require("dotenv").config();

const hre = require("hardhat");

const PRESALE_ABI = [
  "function currentBatch() view returns (uint8)",
  "function batchInfo(uint8) view returns (uint256,uint256,uint256,uint256,uint256,uint64,uint64,bool)",
  "function finalized() view returns (bool)",
  "function advanceIfEnded()",
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const provider = new hre.ethers.JsonRpcProvider(
    process.env.BSC_RPC_URL || process.env.BSC_TESTNET_RPC
  );

  const wallet = new hre.ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

  const presale = new hre.ethers.Contract(
    process.env.PRESALE,
    PRESALE_ABI,
    wallet
  );

  console.log("=== DDC BATCH KEEPER STARTED ===");
  console.log("Wallet:", wallet.address);
  console.log("Presale:", process.env.PRESALE);

  while (true) {
    try {
      const finalized = await presale.finalized();

      if (finalized) {
        console.log("[KEEPER] Presale finalized");
        await sleep(15000);
        continue;
      }

      const batchId = Number(await presale.currentBatch());

      const info = await presale.batchInfo(batchId);

      const hardCap = BigInt(info[3].toString());
      const sold = BigInt(info[4].toString());
      const endTime = Number(info[6].toString());

      const now = Math.floor(Date.now() / 1000);

      const soldOut = sold >= hardCap;
      const expired = now > endTime;

      console.log(
        `[KEEPER] batch=${batchId} sold=${sold} hardCap=${hardCap} expired=${expired}`
      );

      if (soldOut || expired) {
        console.log("[KEEPER] advancing batch...");

        const tx = await presale.advanceIfEnded();

        console.log("[KEEPER] tx:", tx.hash);

        await tx.wait();

        console.log("[KEEPER] batch advanced");
      }
    } catch (e) {
      console.error("[KEEPER ERROR]", e.message);
    }

    await sleep(15000);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
