const { LockManager } = require("../prototype/real-node/lock_rules");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== LOCK RULES CHECK ===");

const lm = new LockManager();

// validator lockuje block-A u rundi 1
lm.lock("v1", "block-A", 1);

must("validator locked on block-A", lm.getLock("v1").blockHash === "block-A");

// pokušaj glasanja za drugi blok
must(
  "cannot vote for different block after lock",
  lm.canVote("v1", "block-B") === false
);

// može da glasa za isti blok
must(
  "can vote for same block",
  lm.canVote("v1", "block-A") === true
);

// viša runda može update-ovati lock
lm.lock("v1", "block-A", 2);

must(
  "lock updates on higher round",
  lm.getLock("v1").round === 2
);

// pokušaj prebacivanja na drugi blok u istoj rundi
lm.lock("v1", "block-B", 2);

must(
  "cannot override lock with different block same round",
  lm.getLock("v1").blockHash === "block-A"
);

console.log("LOCK RULES CHECK PASSED");
