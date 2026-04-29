const crypto = require("crypto");
const { verifyAttestation } = require("./crypto/validator_keys");

function hash(x) {
  return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
}

function canonicalPayload(att) {
  return {
    validatorId: att.validatorId,
    blockHash: att.blockHash,
    branchId: att.branchId,
    status: att.status,
  };
}

function createDoubleSignEvidence(attA, attB) {
  if (attA.validatorId !== attB.validatorId) {
    throw new Error("different validators");
  }

  if (attA.branchId !== attB.branchId) {
    throw new Error("different branches");
  }

  if (attA.blockHash === attB.blockHash && attA.status === attB.status) {
    throw new Error("not conflicting");
  }

  const evidence = {
    type: "DOUBLE_SIGN_EVIDENCE",
    validatorId: attA.validatorId,
    branchId: attA.branchId,
    attestationA: attA,
    attestationB: attB,
  };

  return {
    ...evidence,
    evidenceHash: hash(evidence),
  };
}

function verifyDoubleSignEvidence(evidence, registry) {
  if (!evidence || evidence.type !== "DOUBLE_SIGN_EVIDENCE") return false;

  const validator = registry.get(evidence.validatorId);
  if (!validator) return false;

  const a = evidence.attestationA;
  const b = evidence.attestationB;

  if (a.validatorId !== evidence.validatorId) return false;
  if (b.validatorId !== evidence.validatorId) return false;
  if (a.branchId !== b.branchId) return false;
  if (a.blockHash === b.blockHash && a.status === b.status) return false;

  const sigA = verifyAttestation(
    validator.publicKeyPem,
    canonicalPayload(a),
    a.signature
  );

  const sigB = verifyAttestation(
    validator.publicKeyPem,
    canonicalPayload(b),
    b.signature
  );

  return sigA && sigB;
}

function applyEvidenceSlash(evidence, registry) {
  if (!verifyDoubleSignEvidence(evidence, registry)) {
    throw new Error("invalid evidence");
  }

  const v = registry.get(evidence.validatorId);
  registry.slash(evidence.validatorId, v.stake);

  return {
    validatorId: evidence.validatorId,
    evidenceHash: evidence.evidenceHash,
    slashed: true,
  };
}

module.exports = {
  canonicalPayload,
  createDoubleSignEvidence,
  verifyDoubleSignEvidence,
  applyEvidenceSlash,
};
