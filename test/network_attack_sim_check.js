const {
  partitionDoubleFinalityScenario,
  overlappingPartitionAttackScenario,
  delayedMessageReorderScenario,
} = require("../prototype/real-node/network_attack_sim");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== NETWORK ATTACK SIMULATION CHECK ===");

const partition = partitionDoubleFinalityScenario();

must("partition does not produce double finality", partition.doubleFinality === false);
must("partition double-finality attack defended", partition.defended === true);

const overlap = overlappingPartitionAttackScenario();

must("overlap attack requires slashable equivocation", overlap.requiresSlashableEquivocation === true);
must("overlap partition attack is not silent", overlap.defended === true);

const delayed = delayedMessageReorderScenario();

must("delayed/reordered old messages rejected", delayed.defended === true);
must("only current height/round messages accepted", delayed.accepted.length === 2);

console.log("NETWORK ATTACK SIMULATION CHECK PASSED");
