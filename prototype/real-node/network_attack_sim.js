const { hasTwoThirdsQuorum } = require("./stake_weighted_consensus");

function partitionDoubleFinalityScenario() {
  const validators = [
    { validatorId: "v1", stake: 40, active: true },
    { validatorId: "v2", stake: 30, active: true },
    { validatorId: "v3", stake: 20, active: true },
    { validatorId: "v4", stake: 10, active: true },
  ];

  const partitionA = ["v1", "v3"]; // 60 stake
  const partitionB = ["v2", "v4"]; // 40 stake

  function votesFor(blockHash, members) {
    return members.map(validatorId => ({
      validatorId,
      blockHash,
      status: "confirmed",
    }));
  }

  const blockA = hasTwoThirdsQuorum(
    validators,
    votesFor("block-A", partitionA)
  );

  const blockB = hasTwoThirdsQuorum(
    validators,
    votesFor("block-B", partitionB)
  );

  return {
    attack: "PARTITION_DOUBLE_FINALITY",
    blockA,
    blockB,
    doubleFinality: blockA.finality && blockB.finality,
    defended: !(blockA.finality && blockB.finality),
  };
}

function overlappingPartitionAttackScenario() {
  const validators = [
    { validatorId: "v1", stake: 34, active: true },
    { validatorId: "v2", stake: 33, active: true },
    { validatorId: "v3", stake: 33, active: true },
  ];

  const blockAVotes = [
    { validatorId: "v1", blockHash: "block-A", status: "confirmed" },
    { validatorId: "v2", blockHash: "block-A", status: "confirmed" },
  ]; // 67 stake

  const blockBVotes = [
    { validatorId: "v1", blockHash: "block-B", status: "confirmed" },
    { validatorId: "v3", blockHash: "block-B", status: "confirmed" },
  ]; // 67 stake, requires v1 double-vote

  const blockA = hasTwoThirdsQuorum(validators, blockAVotes);
  const blockB = hasTwoThirdsQuorum(validators, blockBVotes);

  const doubleVoters = blockAVotes
    .map(v => v.validatorId)
    .filter(id => blockBVotes.some(v => v.validatorId === id));

  return {
    attack: "OVERLAPPING_PARTITION_DOUBLE_VOTE",
    blockA,
    blockB,
    doubleVoters,
    doubleFinality: blockA.finality && blockB.finality,
    requiresSlashableEquivocation: doubleVoters.length > 0,
    defended: !(blockA.finality && blockB.finality) || doubleVoters.length > 0,
  };
}

function delayedMessageReorderScenario() {
  const currentHeight = 10;
  const currentRound = 3;

  const messages = [
    { type: "PREVOTE", height: 10, round: 3, validatorId: "v1" },
    { type: "PRECOMMIT", height: 10, round: 3, validatorId: "v1" },
    { type: "PREVOTE", height: 9, round: 8, validatorId: "v2" },
    { type: "PRECOMMIT", height: 10, round: 1, validatorId: "v3" },
  ];

  const accepted = messages.filter(
    m => m.height === currentHeight && m.round === currentRound
  );

  const rejected = messages.filter(
    m => !(m.height === currentHeight && m.round === currentRound)
  );

  return {
    attack: "DELAYED_REORDERED_MESSAGES",
    accepted,
    rejected,
    defended: accepted.length === 2 && rejected.length === 2,
  };
}

module.exports = {
  partitionDoubleFinalityScenario,
  overlappingPartitionAttackScenario,
  delayedMessageReorderScenario,
};
