const {
  partitionForkMergeScenario,
  privateForkCannotOverrideFinalityScenario,
  slashableEquivocationRequiredForDoubleFinalityScenario,
} = require("../prototype/real-node/partition_fork_merge");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== PARTITION FORK MERGE CHECK ===");

const partition = partitionForkMergeScenario();

must("majority partition finalizes canonical block", partition.forkA.finalized === true);
must("minority partition cannot finalize competing fork", partition.forkB.finalized === false);
must("merge keeps finalized canonical block", partition.canonicalAfterMerge === "block-A");
must("merge does not reorg finalized block", partition.reorgFinalizedBlock === false);
must("partition fork merge defended", partition.defended === true);

const privateFork = privateForkCannotOverrideFinalityScenario();

must("public finality exists", privateFork.publicFinal.finalized === true);
must("private fork cannot override finalized block", privateFork.privateForkAccepted === false);
must("private fork attack defended", privateFork.defended === true);

const equivocation = slashableEquivocationRequiredForDoubleFinalityScenario();

must("double finality requires validator equivocation", equivocation.doubleVoters.length > 0);
must("double finality is not silent", equivocation.defended === true);

console.log("PARTITION FORK MERGE CHECK PASSED");
