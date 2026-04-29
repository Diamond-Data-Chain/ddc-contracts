const { hasTwoThirdsQuorum } = require("./stake_weighted_consensus");

function selectProposer(validators, height, round) {
  const active = validators.filter(v => v.active);
  if (!active.length) throw new Error("no active validators");

  const index = (height + round) % active.length;
  return active[index].validatorId;
}

function createProposal({ height, round, proposerId, blockHash }) {
  return {
    type: "PROPOSAL",
    height,
    round,
    proposerId,
    blockHash,
  };
}

function validateProposal(proposal, validators, height, round) {
  const expected = selectProposer(validators, height, round);
  return proposal.proposerId === expected;
}

function prevote(validators, proposal) {
  return validators
    .filter(v => v.active)
    .map(v => ({
      type: "PREVOTE",
      validatorId: v.validatorId,
      height: proposal.height,
      round: proposal.round,
      blockHash: proposal.blockHash,
      status: "confirmed",
    }));
}

function precommit(validators, proposal, prevotes) {
  const q = hasTwoThirdsQuorum(validators, prevotes);

  if (!q.finality) {
    return [];
  }

  return validators
    .filter(v => v.active)
    .map(v => ({
      type: "PRECOMMIT",
      validatorId: v.validatorId,
      height: proposal.height,
      round: proposal.round,
      blockHash: proposal.blockHash,
      status: "confirmed",
    }));
}

function finalize(validators, proposal, precommits) {
  const q = hasTwoThirdsQuorum(validators, precommits);

  return {
    height: proposal.height,
    round: proposal.round,
    blockHash: proposal.blockHash,
    proposerId: proposal.proposerId,
    totalStake: q.totalStake,
    confirmedPower: q.confirmedPower,
    requiredPower: q.requiredPower,
    finalized: q.finality,
  };
}

function runRound({ validators, height, round, blockHash }) {
  const proposerId = selectProposer(validators, height, round);
  const proposal = createProposal({ height, round, proposerId, blockHash });

  if (!validateProposal(proposal, validators, height, round)) {
    throw new Error("invalid proposer");
  }

  const prevotes = prevote(validators, proposal);
  const precommits = precommit(validators, proposal, prevotes);
  const result = finalize(validators, proposal, precommits);

  return {
    proposal,
    prevotes,
    precommits,
    result,
  };
}

module.exports = {
  selectProposer,
  createProposal,
  validateProposal,
  prevote,
  precommit,
  finalize,
  runRound,
};
