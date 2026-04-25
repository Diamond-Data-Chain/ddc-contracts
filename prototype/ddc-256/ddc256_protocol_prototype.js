#!/usr/bin/env node

const crypto = require("crypto");

const TOTAL_BRANCHES = 256;
const REQUIRED_CONFIRMATIONS = 172;

function hash(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function makeValidators(count = 32) {
  return Array.from({ length: count }, (_, i) => ({
    id: `validator-${i + 1}`,
    stake: 10000 + i * 1000,
    publicKey: hash(`validator-${i + 1}-pubkey`).slice(0, 40),
    reputation: 100,
  }));
}

function weightedPick(validators, seed) {
  const totalStake = validators.reduce((s, v) => s + v.stake, 0);
  const r = parseInt(hash(seed).slice(0, 12), 16) % totalStake;

  let acc = 0;
  for (const v of validators) {
    acc += v.stake;
    if (r < acc) return v;
  }
  return validators[validators.length - 1];
}

function assignBranches(validators, epochId, previousCheckpointHash) {
  const validatorSetRoot = hash(JSON.stringify(validators.map(v => [v.id, v.stake])));
  const randomSeed = hash(`${previousCheckpointHash}:${epochId}:${validatorSetRoot}`);

  return Array.from({ length: TOTAL_BRANCHES }, (_, i) => {
    const branchId = i + 1;
    const validator = weightedPick(validators, `${randomSeed}:${branchId}`);

    return {
      branchId,
      validatorId: validator.id,
      validatorKey: validator.publicKey,
    };
  });
}

function validateObject(dataObject) {
  const errors = [];

  if (!dataObject.datasetId) errors.push("missing datasetId");
  if (!dataObject.submitter) errors.push("missing submitter");
  if (!dataObject.submitterType) errors.push("missing submitterType");
  if (!dataObject.contentHash) errors.push("missing contentHash");
  if (!dataObject.metadataHash) errors.push("missing metadataHash");
  if (!dataObject.sourceReference) errors.push("missing sourceReference");
  if (!dataObject.signature) errors.push("missing signature");

  return {
    schemaValid: errors.length === 0,
    errors,
  };
}

function signBranchResult(branch, objectHash, status) {
  return hash(`${branch.branchId}:${branch.validatorId}:${objectHash}:${status}:${branch.validatorKey}`);
}

function runConsensus({ scenario = "normal" }) {
  const validators = makeValidators(32);
  const previousCheckpointHash = hash("checkpoint-0");
  const epochId = 1;

  const dataObject = {
    datasetId: "dataset-demo-001",
    submitter: "verified-org-demo",
    submitterType: "verified_organization",
    contentHash: hash("example industrial dataset"),
    metadataHash: hash("metadata:machine=qr-reader-7;line=A"),
    sourceReference: "factory-line-A",
    signature: hash("submitter-signature"),
  };

  const objectValidation = validateObject(dataObject);
  const objectHash = hash(JSON.stringify(dataObject));

  const assignments = assignBranches(validators, epochId, previousCheckpointHash);

  let confirmed = 0;
  let rejected = 0;
  let timedOut = 0;

  const attestations = assignments.map(branch => {
    const branchNoise = parseInt(hash(`${scenario}:${objectHash}:${branch.branchId}`).slice(0, 8), 16) / 0xffffffff;

    let status;
    if (!objectValidation.schemaValid) {
      status = "rejected";
    } else if (scenario === "attack") {
      status = branchNoise < 0.50 ? "confirmed" : "rejected";
    } else if (scenario === "timeout") {
      status = branchNoise < 0.70 ? "confirmed" : branchNoise < 0.90 ? "timeout" : "rejected";
    } else {
      status = branchNoise < 0.82 ? "confirmed" : branchNoise < 0.98 ? "rejected" : "timeout";
    }

    if (status === "confirmed") confirmed++;
    if (status === "rejected") rejected++;
    if (status === "timeout") timedOut++;

    return {
      branchId: branch.branchId,
      validatorId: branch.validatorId,
      status,
      signature: signBranchResult(branch, objectHash, status),
    };
  });

  const finality = confirmed >= REQUIRED_CONFIRMATIONS;

  const proofRoot = hash(JSON.stringify(attestations.map(a => [a.branchId, a.validatorId, a.status, a.signature])));

  return {
    protocol: "DDC-256 Protocol Prototype",
    status: "local prototype, not node software",
    epochId,
    totalBranches: TOTAL_BRANCHES,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    objectHash,
    objectValidation,
    confirmed,
    rejected,
    timedOut,
    finality,
    proofRoot,
    sampleAttestations: attestations.slice(0, 10),
  };
}

const scenario = process.argv[2] || "normal";
console.log(JSON.stringify(runConsensus({ scenario }), null, 2));
