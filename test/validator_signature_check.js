const {
  createValidatorKeypair,
  exportPublicKey,
  signAttestation,
  verifyAttestation,
} = require("../prototype/real-node/crypto/validator_keys");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VALIDATOR SIGNATURE CHECK ===");

const { publicKey, privateKey } = createValidatorKeypair();
const publicKeyPem = exportPublicKey(publicKey);

const attestation = {
  validatorId: "validator-1",
  blockHash: "block-hash-001",
  branchId: 1,
  status: "confirmed",
};

const sig = signAttestation(privateKey, attestation);

must("valid signature verifies", verifyAttestation(publicKeyPem, attestation, sig));

const tampered = {
  ...attestation,
  status: "rejected",
};

must("tampered attestation fails verification", !verifyAttestation(publicKeyPem, tampered, sig));

const other = createValidatorKeypair();
const otherPub = exportPublicKey(other.publicKey);

must("wrong public key fails verification", !verifyAttestation(otherPub, attestation, sig));

console.log("VALIDATOR SIGNATURE CHECK PASSED");
