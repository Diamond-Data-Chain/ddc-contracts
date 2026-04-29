const { ValidatorRegistry } = require("../prototype/real-node/validator_registry");
const {
  createValidatorKeypair,
  exportPublicKey,
} = require("../prototype/real-node/crypto/validator_keys");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VALIDATOR REGISTRY CHECK ===");

const registry = new ValidatorRegistry();

const k1 = createValidatorKeypair();
const k2 = createValidatorKeypair();

registry.register({
  validatorId: "validator-1",
  publicKeyPem: exportPublicKey(k1.publicKey),
  stake: 10000,
});

registry.register({
  validatorId: "validator-2",
  publicKeyPem: exportPublicKey(k2.publicKey),
  stake: 15000,
});

must("validator-1 registered", registry.get("validator-1") !== null);
must("validator-2 registered", registry.get("validator-2") !== null);
must("unknown validator not active", registry.isActive("unknown") === false);
must("registered validator active", registry.isActive("validator-1") === true);

let duplicateRejected = false;
try {
  registry.register({
    validatorId: "validator-1",
    publicKeyPem: exportPublicKey(k1.publicKey),
    stake: 10000,
  });
} catch (_) {
  duplicateRejected = true;
}

must("duplicate validator rejected", duplicateRejected);

registry.slash("validator-1", 10000);

must("slashed validator inactive", registry.isActive("validator-1") === false);
must("honest validator still active", registry.isActive("validator-2") === true);
must("only one active validator remains", registry.activeValidators().length === 1);

console.log("VALIDATOR REGISTRY CHECK PASSED");
