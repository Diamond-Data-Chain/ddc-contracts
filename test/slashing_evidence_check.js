const { ValidatorRegistry } = require("../prototype/real-node/validator_registry");
const {
  createValidatorKeypair,
  exportPublicKey,
  signAttestation,
} = require("../prototype/real-node/crypto/validator_keys");
const {
  canonicalPayload,
  createDoubleSignEvidence,
  verifyDoubleSignEvidence,
  applyEvidenceSlash,
} = require("../prototype/real-node/slashing_evidence");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== GLOBAL SLASHING EVIDENCE CHECK ===");

const registry = new ValidatorRegistry();
const keys = createValidatorKeypair();
const publicKeyPem = exportPublicKey(keys.publicKey);

registry.register({
  validatorId: "validator-1",
  publicKeyPem,
  stake: 10000,
});

const attA = {
  validatorId: "validator-1",
  branchId: 7,
  blockHash: "block-A",
  status: "confirmed",
};

attA.signature = signAttestation(keys.privateKey, canonicalPayload(attA));

const attB = {
  validatorId: "validator-1",
  branchId: 7,
  blockHash: "block-B",
  status: "confirmed",
};

attB.signature = signAttestation(keys.privateKey, canonicalPayload(attB));

const evidence = createDoubleSignEvidence(attA, attB);

must("evidence hash exists", !!evidence.evidenceHash);
must("double-sign evidence verifies globally", verifyDoubleSignEvidence(evidence, registry));

const result = applyEvidenceSlash(evidence, registry);

must("evidence slash applied", result.slashed === true);
must("validator inactive after evidence slash", registry.isActive("validator-1") === false);

const tampered = JSON.parse(JSON.stringify(evidence));
tampered.attestationB.blockHash = "block-C";

must("tampered evidence rejected", verifyDoubleSignEvidence(tampered, registry) === false);

console.log("GLOBAL SLASHING EVIDENCE CHECK PASSED");
