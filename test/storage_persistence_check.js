const os = require("os");
const path = require("path");
const fs = require("fs");
const { JsonStateStore } = require("../prototype/real-node/storage");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== STORAGE PERSISTENCE CHECK ===");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ddc-store-"));

const store1 = new JsonStateStore(dir);

store1.save("chain_state", {
  height: 1,
  headBlockHash: "block-001",
});

store1.append("blocks", {
  height: 1,
  blockHash: "block-001",
});

store1.append("attestations", {
  validatorId: "validator-1",
  blockHash: "block-001",
  status: "confirmed",
});

const store2 = new JsonStateStore(dir);

const chainState = store2.load("chain_state", null);
const blocks = store2.load("blocks", []);
const attestations = store2.load("attestations", []);

must("chain state survives restart", chainState.headBlockHash === "block-001");
must("blocks survive restart", blocks.length === 1 && blocks[0].blockHash === "block-001");
must("attestations survive restart", attestations.length === 1 && attestations[0].validatorId === "validator-1");

store2.clear();

console.log("STORAGE PERSISTENCE CHECK PASSED");
