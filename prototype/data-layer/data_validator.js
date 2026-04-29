#!/usr/bin/env node

const crypto = require("crypto");

function hash(x) {
  return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
}

function validateDataObject(obj, state) {
  const errors = [];

  if (!obj.datasetId) errors.push("missing datasetId");
  if (!obj.submitterId) errors.push("missing submitterId");
  if (!obj.submitterType) errors.push("missing submitterType");
  if (!obj.contentHash) errors.push("missing contentHash");
  if (!obj.sourceRef) errors.push("missing sourceRef");
  if (!obj.timestamp) errors.push("missing timestamp");
  if (!obj.schemaVersion) errors.push("missing schemaVersion");

  const objectHash = hash({
    datasetId: obj.datasetId,
    contentHash: obj.contentHash,
    sourceRef: obj.sourceRef,
    timestamp: obj.timestamp,
    schemaVersion: obj.schemaVersion,
  });

  if (state.seenObjectHashes.has(objectHash)) {
    errors.push("replay detected");
  }

  const existing = state.datasetLatest.get(obj.datasetId);
  if (existing && existing.contentHash !== obj.contentHash) {
    errors.push("conflicting dataset update");
  }

  if (obj.submitterType === "human_kyc" && !obj.kycRef) {
    errors.push("human KYC submitter requires kycRef");
  }

  if (obj.submitterType === "device" && !obj.deviceSignature) {
    errors.push("device submitter requires deviceSignature");
  }

  if (obj.submitterType === "oracle_api" && !obj.oracleProof) {
    errors.push("oracle submitter requires oracleProof");
  }

  if (obj.claimType === "real_world_fact" && !obj.verificationRefs?.length) {
    errors.push("real-world fact requires verificationRefs");
  }

  const valid = errors.length === 0;

  if (valid) {
    state.seenObjectHashes.add(objectHash);
    state.datasetLatest.set(obj.datasetId, obj);
  }

  return {
    valid,
    objectHash,
    status: valid ? "accepted" : "rejected",
    errors,
  };
}

function runScenario(name) {
  const state = {
    seenObjectHashes: new Set(),
    datasetLatest: new Map(),
  };

  const base = {
    datasetId: "industrial-batch-001",
    submitterId: "factory-kyc-operator-01",
    submitterType: "human_kyc",
    kycRef: "kyc-proof-hash-001",
    contentHash: "hash-temperature-21c",
    sourceRef: "factory-sensor-line-a",
    timestamp: "2026-04-28T12:00:00Z",
    schemaVersion: "1.0",
    claimType: "real_world_fact",
    verificationRefs: ["sensor-signature-001", "factory-log-001"],
  };

  if (name === "valid") {
    return validateDataObject(base, state);
  }

  if (name === "replay") {
    validateDataObject(base, state);
    return validateDataObject(base, state);
  }

  if (name === "conflict") {
    validateDataObject(base, state);
    return validateDataObject({ ...base, contentHash: "hash-temperature-99c" }, state);
  }

  if (name === "invalid_plausible") {
    return validateDataObject({
      ...base,
      verificationRefs: [],
    }, state);
  }

  throw new Error(`Unknown scenario: ${name}`);
}

const scenario = process.argv[2] || "valid";
const allowed = ["valid", "replay", "conflict", "invalid_plausible"];

if (!allowed.includes(scenario)) {
  console.error(`Use: ${allowed.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify(runScenario(scenario), null, 2));
