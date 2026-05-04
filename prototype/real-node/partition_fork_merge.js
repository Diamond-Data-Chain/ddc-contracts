const { hasTwoThirdsQuorum } = require("./stake_weighted_consensus");

const validators = [
  { validatorId: "v1", stake: 40, active: true },
  { validatorId: "v2", stake: 30, active: true },
  { validatorId: "v3", stake: 20, active: true },
  { validatorId: "v4", stake: 10, active: true },
];

function votes(blockHash, ids) {
  return ids.map(validatorId => ({
    validatorId,
    blockHash,
    status: "confirmed",
  }));
}

function finalizeCandidate(blockHash, voterIds) {
  const q = hasTwoThirdsQuorum(validators, votes(blockHash, voterIds));
  return {
    blockHash,
    voterIds,
    confirmedPower: q.confirmedPower,
    finalized: q.finality,
  };
}

function partitionForkMergeScenario() {
  // Partition A ima >2/3 i može finalizovati block-A.
  const forkA = finalizeCandidate("block-A", ["v1", "v2"]); // 70

  // Partition B nema >2/3 i NE sme finalizovati block-B.
  const forkB = finalizeCandidate("block-B", ["v3", "v4"]); // 30

  // Merge rule: finalizovani blok se ne sme prepisati nefinalnim forkom.
  const canonicalAfterMerge = forkA.finalized ? forkA.blockHash : null;

  const reorgFinalizedBlock =
    forkA.finalized &&
    forkB.blockHash !== forkA.blockHash &&
    forkB.finalized;

  return {
    attack: "PARTITION_FORK_MERGE",
    forkA,
    forkB,
    canonicalAfterMerge,
    reorgFinalizedBlock,
    defended:
      forkA.finalized === true &&
      forkB.finalized === false &&
      canonicalAfterMerge === "block-A" &&
      reorgFinalizedBlock === false,
  };
}

function privateForkCannotOverrideFinalityScenario() {
  const publicFinal = finalizeCandidate("public-final", ["v1", "v2"]); // 70
  const privateFork = finalizeCandidate("private-fork", ["v3", "v4"]); // 30

  const privateForkAccepted =
    publicFinal.finalized &&
    privateFork.finalized &&
    privateFork.blockHash !== publicFinal.blockHash;

  return {
    attack: "PRIVATE_FORK_AFTER_FINALITY",
    publicFinal,
    privateFork,
    privateForkAccepted,
    defended: publicFinal.finalized === true && privateForkAccepted === false,
  };
}

function slashableEquivocationRequiredForDoubleFinalityScenario() {
  const blockA = finalizeCandidate("block-A", ["v1", "v2"]); // 70
  const blockB = finalizeCandidate("block-B", ["v1", "v3", "v4"]); // 70, v1 equivocation

  const doubleVoters = blockA.voterIds.filter(id => blockB.voterIds.includes(id));

  return {
    attack: "DOUBLE_FINALITY_REQUIRES_EQUIVOCATION",
    blockA,
    blockB,
    doubleFinality: blockA.finalized && blockB.finalized,
    doubleVoters,
    defended:
      blockA.finalized === true &&
      blockB.finalized === true &&
      doubleVoters.length > 0,
  };
}

module.exports = {
  partitionForkMergeScenario,
  privateForkCannotOverrideFinalityScenario,
  slashableEquivocationRequiredForDoubleFinalityScenario,
};
