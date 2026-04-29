const {
  detectDoubleSign,
  applySlashing,
} = require("../prototype/real-node/slashing");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== SLASHING CHECK ===");

const valid = [
  {
    validatorId: "validator-1",
    branchId: 1,
    blockHash: "block-A",
    status: "confirmed",
  },
  {
    validatorId: "validator-2",
    branchId: 1,
    blockHash: "block-A",
    status: "confirmed",
  },
];

const validFaults = detectDoubleSign(valid);
must("valid attestations do not slash", validFaults.length === 0);

const doubleSign = [
  {
    validatorId: "validator-1",
    branchId: 1,
    blockHash: "block-A",
    status: "confirmed",
  },
  {
    validatorId: "validator-1",
    branchId: 1,
    blockHash: "block-B",
    status: "confirmed",
  },
];

const faults = detectDoubleSign(doubleSign);

must("double-sign detected", faults.length === 1);
must("double-sign fault type correct", faults[0].fault === "DOUBLE_SIGN");

const validators = {
  "validator-1": { stake: 10000, slashed: 0, active: true },
  "validator-2": { stake: 10000, slashed: 0, active: true },
};

const result = applySlashing(validators, faults);

must("double signer stake reduced to zero", result["validator-1"].stake === 0);
must("double signer marked inactive", result["validator-1"].active === false);
must("honest validator remains active", result["validator-2"].active === true);

console.log("SLASHING CHECK PASSED");
