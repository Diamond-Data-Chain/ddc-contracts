const { LockManager } = require("../prototype/real-node/lock_rules");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== LOCK RULES CHECK ===");

const validators = [
  { validatorId: "v1", stake: 40, active: true },
  { validatorId: "v2", stake: 30, active: true },
  { validatorId: "v3", stake: 20, active: true },
  { validatorId: "v4", stake: 10, active: true },
];

const lm = new LockManager();

lm.lock("v1", "block-A", 1);

must("validator locked on block-A", lm.getLock("v1").blockHash === "block-A");
must("cannot vote for different block after lock", lm.canVote("v1", "block-B") === false);
must("can vote for same block", lm.canVote("v1", "block-A") === true);

lm.lock("v1", "block-A", 2);
must("lock updates on higher round same block", lm.getLock("v1").round === 2);

lm.lock("v1", "block-B", 2);
must("cannot override lock with different block same round", lm.getLock("v1").blockHash === "block-A");

const weakPrevotes = [
  { validatorId: "v2", blockHash: "block-B", round: 3, status: "confirmed" },
  { validatorId: "v3", blockHash: "block-B", round: 3, status: "confirmed" },
];

must(
  "cannot unlock without >2/3 prevote proof",
  lm.canUnlock("v1", "block-B", 3, validators, weakPrevotes) === false
);

const strongPrevotes = [
  { validatorId: "v1", blockHash: "block-B", round: 3, status: "confirmed" },
  { validatorId: "v2", blockHash: "block-B", round: 3, status: "confirmed" },
];

must(
  "can unlock with >2/3 prevote proof in higher round",
  lm.canUnlock("v1", "block-B", 3, validators, strongPrevotes) === true
);

must(
  "unlock and relock succeeds with quorum proof",
  lm.unlockAndRelock("v1", "block-B", 3, validators, strongPrevotes) === true
);

must("validator relocked on block-B", lm.getLock("v1").blockHash === "block-B");

const oldRoundPrevotes = [
  { validatorId: "v1", blockHash: "block-C", round: 2, status: "confirmed" },
  { validatorId: "v2", blockHash: "block-C", round: 2, status: "confirmed" },
  { validatorId: "v3", blockHash: "block-C", round: 2, status: "confirmed" },
];

must(
  "cannot unlock to lower/equal round even with quorum",
  lm.canUnlock("v1", "block-C", 2, validators, oldRoundPrevotes) === false
);

console.log("LOCK RULES CHECK PASSED");
