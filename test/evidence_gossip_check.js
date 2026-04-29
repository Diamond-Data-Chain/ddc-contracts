const { ValidatorRegistry } = require("../prototype/real-node/validator_registry");
const {
  createValidatorKeypair,
  exportPublicKey,
  signAttestation,
} = require("../prototype/real-node/crypto/validator_keys");
const {
  canonicalPayload,
  createDoubleSignEvidence,
} = require("../prototype/real-node/slashing_evidence");
const { EvidencePool } = require("../prototype/real-node/evidence_gossip");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== EVIDENCE GOSSIP CHECK ===");

// 🔥 JEDAN validator za sve nodove
const keys = createValidatorKeypair();
const publicKeyPem = exportPublicKey(keys.publicKey);

function createRegistry() {
  const registry = new ValidatorRegistry();

  registry.register({
    validatorId: "validator-1",
    publicKeyPem,
    stake: 10000,
  });

  return registry;
}

// napravi evidence jednom
const attA = {
  validatorId: "validator-1",
  branchId: 3,
  blockHash: "block-A",
  status: "confirmed",
};
attA.signature = signAttestation(keys.privateKey, canonicalPayload(attA));

const attB = {
  validatorId: "validator-1",
  branchId: 3,
  blockHash: "block-B",
  status: "confirmed",
};
attB.signature = signAttestation(keys.privateKey, canonicalPayload(attB));

const evidence = createDoubleSignEvidence(attA, attB);

// 3 noda sa ISTIM validator registry-jem
const poolA = new EvidencePool(createRegistry());
const poolB = new EvidencePool(createRegistry());
const poolC = new EvidencePool(createRegistry());

// A primi
const rA = poolA.receive(evidence);
must("node A accepts evidence", rA.accepted === true);
must("node A slashes validator", poolA.registry.isActive("validator-1") === false);

// gossip → B
const rB = poolB.receive(evidence);
must("node B accepts gossiped evidence", rB.accepted === true);
must("node B slashes validator", poolB.registry.isActive("validator-1") === false);

// gossip → C
const rC = poolC.receive(evidence);
must("node C accepts gossiped evidence", rC.accepted === true);
must("node C slashes validator", poolC.registry.isActive("validator-1") === false);

// duplicate
const dup = poolC.receive(evidence);
must("duplicate rejected", dup.accepted === false);

console.log("EVIDENCE GOSSIP CHECK PASSED");
