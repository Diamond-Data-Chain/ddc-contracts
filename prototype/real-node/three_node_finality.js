#!/usr/bin/env node

const crypto = require("crypto");

const REQUIRED_CONFIRMATIONS = 2; // 2/3 local node prototype

function hash(x) {
  return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
}

function log(event, data = {}) {
  console.log(JSON.stringify({ event, ...data }));
}

function makeBlock(proposer) {
  const block = {
    height: 1,
    proposer,
    timestamp: new Date().toISOString(),
    txs: [
      { from: "account-1", to: "account-2", amount: "10", nonce: 1 }
    ]
  };

  return { ...block, blockHash: hash(block) };
}

function attest(nodeId, block, status = "confirmed") {
  return {
    nodeId,
    blockHash: block.blockHash,
    status,
    signature: hash(`${nodeId}:${block.blockHash}:${status}`)
  };
}

function aggregate(attestations) {
  const confirmed = attestations.filter(a => a.status === "confirmed").length;
  const rejected = attestations.filter(a => a.status === "rejected").length;

  return {
    confirmed,
    rejected,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    finality: confirmed >= REQUIRED_CONFIRMATIONS,
    proofRoot: hash(attestations.map(a => [a.nodeId, a.blockHash, a.status, a.signature]))
  };
}

function run(scenario = "normal") {
  const nodes = ["node-A", "node-B", "node-C"];
  const block = makeBlock("node-A");

  log("BLOCK_PROPOSED", { proposer: "node-A", blockHash: block.blockHash });

  const attestations = [];

  for (const node of nodes) {
    if (node === "node-A") continue;

    const status = scenario === "attack" && node === "node-C"
      ? "rejected"
      : "confirmed";

    const att = attest(node, block, status);
    attestations.push(att);

    log("ATTESTATION", {
      node,
      blockHash: block.blockHash,
      status
    });
  }

  const finality = aggregate(attestations);

  log("FINALITY_PROOF", finality);

  return {
    prototype: "DDC 3-node finality aggregation",
    scenario,
    nodes: nodes.length,
    blockHash: block.blockHash,
    attestations,
    finality
  };
}

const scenario = process.argv[2] || "normal";

if (!["normal", "attack"].includes(scenario)) {
  console.error("Use: normal | attack");
  process.exit(1);
}

console.log(JSON.stringify(run(scenario), null, 2));
