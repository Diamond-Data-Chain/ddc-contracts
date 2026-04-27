#!/usr/bin/env node

const crypto = require("crypto");

const TOTAL_BRANCHES = 256;
const REQUIRED_CONFIRMATIONS = 172;

function hash(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function createValidators(count = 32) {
  return Array.from({ length: count }, (_, i) => ({
    id: `validator-${i + 1}`,
    stake: 10000 + i * 750,
    active: true,
    publicKey: hash(`validator-${i + 1}-public-key`).slice(0, 40),
  }));
}

function weightedPick(validators, seed) {
  const active = validators.filter(v => v.active);
  const totalStake = active.reduce((sum, v) => sum + v.stake, 0);
  const r = parseInt(hash(seed).slice(0, 12), 16) % totalStake;

  let acc = 0;
  for (const v of active) {
    acc += v.stake;
    if (r < acc) return v;
  }
  return active[active.length - 1];
}

function assignBranch(validators, previousBlockHash, height, branchId) {
  const validatorSetRoot = hash(JSON.stringify(validators.map(v => [v.id, v.stake, v.active])));
  const seed = hash(`${previousBlockHash}:${height}:${validatorSetRoot}:${branchId}`);
  return weightedPick(validators, seed);
}

function makeTx(index) {
  return {
    txId: hash(`tx-${index}-${nowIso()}`),
    from: `account-${index}`,
    to: `account-${index + 1}`,
    amount: String(10 * index),
    dataHash: hash(`data-object-${index}`),
    nonce: index,
  };
}

function validateTx(tx) {
  const errors = [];
  if (!tx.txId) errors.push("missing txId");
  if (!tx.from) errors.push("missing from");
  if (!tx.to) errors.push("missing to");
  if (!tx.amount) errors.push("missing amount");
  if (!tx.dataHash) errors.push("missing dataHash");
  if (Number(tx.amount) <= 0) errors.push("non-positive amount");
  return { ok: errors.length === 0, errors };
}

function createBlock({ height, previousBlockHash, mempool }) {
  const txs = mempool.splice(0, mempool.length);
  const txRoot = hash(JSON.stringify(txs.map(tx => tx.txId)));

  return {
    height,
    previousBlockHash,
    timestamp: nowIso(),
    txRoot,
    txs,
  };
}

function validateBlockAcrossBranches({ block, validators, scenario }) {
  const blockHash = hash(JSON.stringify(block));

  let confirmed = 0;
  let rejected = 0;
  let timedOut = 0;

  const attestations = [];

  const txValidation = block.txs.map(tx => validateTx(tx));
  const baseValid = txValidation.every(v => v.ok);

  for (let branchId = 1; branchId <= TOTAL_BRANCHES; branchId++) {
    const validator = assignBranch(validators, block.previousBlockHash, block.height, branchId);
    const r = parseInt(hash(`${scenario}:${blockHash}:${branchId}`).slice(0, 8), 16) / 0xffffffff;

    let status;

    if (!baseValid) {
      status = "rejected";
    } else if (scenario === "attack") {
      status = r < 0.50 ? "confirmed" : "rejected";
    } else if (scenario === "timeout") {
      status = r < 0.70 ? "confirmed" : r < 0.90 ? "timeout" : "rejected";
    } else {
      status = r < 0.84 ? "confirmed" : r < 0.98 ? "rejected" : "timeout";
    }

    if (status === "confirmed") confirmed++;
    if (status === "rejected") rejected++;
    if (status === "timeout") timedOut++;

    attestations.push({
      branchId,
      validatorId: validator.id,
      status,
      signature: hash(`${branchId}:${validator.id}:${blockHash}:${status}:${validator.publicKey}`),
    });
  }

  const finality = confirmed >= REQUIRED_CONFIRMATIONS;
  const proofRoot = hash(JSON.stringify(attestations.map(a => [a.branchId, a.validatorId, a.status, a.signature])));

  return {
    blockHash,
    confirmed,
    rejected,
    timedOut,
    finality,
    proofRoot,
    sampleAttestations: attestations.slice(0, 10),
  };
}

function runMiniNode({ scenario = "normal" }) {
  const validators = createValidators(32);
  const mempool = [];

  for (let i = 1; i <= 5; i++) {
    mempool.push(makeTx(i));
  }

  const previousBlockHash = hash("genesis");
  const block = createBlock({
    height: 1,
    previousBlockHash,
    mempool,
  });

  const finalityProof = validateBlockAcrossBranches({
    block,
    validators,
    scenario,
  });

  return {
    node: "DDC Mini Node Prototype",
    status: "local prototype, not P2P node software",
    scenario,
    mempoolRemaining: mempool.length,
    block,
    consensus: {
      totalBranches: TOTAL_BRANCHES,
      requiredConfirmations: REQUIRED_CONFIRMATIONS,
      ...finalityProof,
    },
  };
}

const scenario = process.argv[2] || "normal";
const allowed = ["normal", "attack", "timeout"];

if (!allowed.includes(scenario)) {
  console.error(`Unknown scenario. Use: ${allowed.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify(runMiniNode({ scenario }), null, 2));
