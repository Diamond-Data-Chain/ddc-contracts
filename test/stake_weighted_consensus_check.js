const {
  totalActiveStake,
  votingPower,
  hasTwoThirdsQuorum,
} = require("../prototype/real-node/stake_weighted_consensus");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== STAKE-WEIGHTED CONSENSUS CHECK ===");

const validators = [
  { validatorId: "v1", stake: 40, active: true },
  { validatorId: "v2", stake: 30, active: true },
  { validatorId: "v3", stake: 20, active: true },
  { validatorId: "v4", stake: 10, active: true },
];

must("total active stake is 100", totalActiveStake(validators) === 100);

const quorumAttestations = [
  { validatorId: "v1", status: "confirmed" },
  { validatorId: "v2", status: "confirmed" },
];

const q = hasTwoThirdsQuorum(validators, quorumAttestations);

must("confirmed power is 70", q.confirmedPower === 70);
must("2/3 quorum reaches finality", q.finality === true);

const weakAttestations = [
  { validatorId: "v2", status: "confirmed" },
  { validatorId: "v3", status: "confirmed" },
  { validatorId: "v4", status: "confirmed" },
];

const weak = hasTwoThirdsQuorum(validators, weakAttestations);

must("60% stake does not reach 2/3 quorum", weak.confirmedPower === 60 && weak.finality === false);

const duplicateAttestations = [
  { validatorId: "v1", status: "confirmed" },
  { validatorId: "v1", status: "confirmed" },
  { validatorId: "v2", status: "confirmed" },
];

must("duplicate validator vote counted once", votingPower(validators, duplicateAttestations) === 70);

const inactiveValidators = [
  { validatorId: "v1", stake: 70, active: false },
  { validatorId: "v2", stake: 30, active: true },
];

const inactiveQ = hasTwoThirdsQuorum(inactiveValidators, [
  { validatorId: "v1", status: "confirmed" },
  { validatorId: "v2", status: "confirmed" },
]);

must("inactive validator ignored", inactiveQ.totalStake === 30 && inactiveQ.confirmedPower === 30);

console.log("STAKE-WEIGHTED CONSENSUS CHECK PASSED");
