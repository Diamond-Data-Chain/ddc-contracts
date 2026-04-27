#!/usr/bin/env node

const crypto = require("crypto");

const TOTAL_BRANCHES = 256;
const REQUIRED_CONFIRMATIONS = 172;

function hash(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function makeNode(id) {
  return {
    id,
    inbox: [],
    outbox: [],
    receivedBlocks: [],
    attestations: [],
  };
}

function makeBlock(proposerId) {
  const txs = [1, 2, 3, 4, 5].map((i) => ({
    txId: hash(`${proposerId}:tx:${i}`),
    from: `account-${i}`,
    to: `account-${i + 1}`,
    amount: String(i * 10),
    nonce: i,
  }));

  return {
    proposerId,
    height: 1,
    previousHash: hash("genesis"),
    txRoot: hash(JSON.stringify(txs.map((t) => t.txId))),
    txs,
  };
}

function broadcast(nodes, fromId, message) {
  for (const node of nodes) {
    if (node.id !== fromId) {
      node.inbox.push({
        from: fromId,
        message,
      });
    }
  }
}

function validateBlock(block) {
  if (!block.proposerId) return false;
  if (!block.txRoot) return false;
  if (!Array.isArray(block.txs)) return false;
  if (block.txs.length === 0) return false;
  return block.txs.every((tx) => tx.txId && tx.from && tx.to && Number(tx.amount) > 0);
}

function branchStatus(blockHash, branchId, scenario) {
  const r = parseInt(hash(`${scenario}:${blockHash}:${branchId}`).slice(0, 8), 16) / 0xffffffff;

  if (scenario === "attack") {
    return r < 0.5 ? "confirmed" : "rejected";
  }

  if (scenario === "timeout") {
    if (r < 0.7) return "confirmed";
    if (r < 0.9) return "timeout";
    return "rejected";
  }

  if (r < 0.84) return "confirmed";
  if (r < 0.98) return "rejected";
  return "timeout";
}

function produceAttestations(node, block, scenario) {
  const blockHash = hash(JSON.stringify(block));
  const validShape = validateBlock(block);

  const attestations = [];

  for (let branchId = 1; branchId <= TOTAL_BRANCHES; branchId++) {
    const status = validShape ? branchStatus(blockHash, branchId, scenario) : "rejected";

    attestations.push({
      nodeId: node.id,
      branchId,
      blockHash,
      status,
      signature: hash(`${node.id}:${branchId}:${blockHash}:${status}`),
    });
  }

  node.attestations.push(...attestations);
  return attestations;
}

function aggregate(attestations) {
  const byBranch = new Map();

  for (const a of attestations) {
    if (!byBranch.has(a.branchId)) {
      byBranch.set(a.branchId, []);
    }
    byBranch.get(a.branchId).push(a);
  }

  let confirmed = 0;
  let rejected = 0;
  let timedOut = 0;

  for (let branchId = 1; branchId <= TOTAL_BRANCHES; branchId++) {
    const votes = byBranch.get(branchId) || [];

    const c = votes.filter((v) => v.status === "confirmed").length;
    const r = votes.filter((v) => v.status === "rejected").length;
    const t = votes.filter((v) => v.status === "timeout").length;

    if (c >= r && c >= t && c > 0) confirmed++;
    else if (r >= c && r >= t && r > 0) rejected++;
    else timedOut++;
  }

  return {
    confirmed,
    rejected,
    timedOut,
    finality: confirmed >= REQUIRED_CONFIRMATIONS,
    proofRoot: hash(JSON.stringify(attestations.map((a) => [a.nodeId, a.branchId, a.status, a.signature]))),
  };
}

function runNetworkFlow(scenario = "normal") {
  const nodes = [makeNode("node-A"), makeNode("node-B"), makeNode("node-C")];

  const proposer = nodes[0];
  const block = makeBlock(proposer.id);
  const blockHash = hash(JSON.stringify(block));

  broadcast(nodes, proposer.id, {
    type: "BLOCK_PROPOSAL",
    block,
    blockHash,
  });

  const allAttestations = [];

  for (const node of nodes) {
    while (node.inbox.length) {
      const item = node.inbox.shift();
      if (item.message.type === "BLOCK_PROPOSAL") {
        node.receivedBlocks.push(item.message.blockHash);
        allAttestations.push(...produceAttestations(node, item.message.block, scenario));
      }
    }
  }

  const result = aggregate(allAttestations);

  return {
    prototype: "DDC Network Message Flow",
    status: "local message-flow prototype, not real P2P",
    scenario,
    nodes: nodes.map((n) => ({
      id: n.id,
      receivedBlocks: n.receivedBlocks.length,
      attestations: n.attestations.length,
    })),
    blockHash,
    totalBranches: TOTAL_BRANCHES,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    aggregation: result,
  };
}

const scenario = process.argv[2] || "normal";
const allowed = ["normal", "attack", "timeout"];

if (!allowed.includes(scenario)) {
  console.error(`Unknown scenario. Use: ${allowed.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify(runNetworkFlow(scenario), null, 2));
