const {
  selectProposer,
  createProposal,
  validateProposal,
  runRound,
  precommit,
  finalize,
} = require("../prototype/real-node/round_consensus");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== ROUND-BASED CONSENSUS CHECK ===");

const validators = [
  { validatorId: "v1", stake: 40, active: true },
  { validatorId: "v2", stake: 30, active: true },
  { validatorId: "v3", stake: 20, active: true },
  { validatorId: "v4", stake: 10, active: true },
];

const proposer = selectProposer(validators, 1, 0);
must("proposer selected", ["v1", "v2", "v3", "v4"].includes(proposer));

const badProposal = createProposal({
  height: 1,
  round: 0,
  proposerId: "fake",
  blockHash: "block-A",
});

must("invalid proposer rejected", validateProposal(badProposal, validators, 1, 0) === false);

const round = runRound({
  validators,
  height: 1,
  round: 0,
  blockHash: "block-A",
});

must("proposal created", round.proposal.type === "PROPOSAL");
must("prevotes created", round.prevotes.length === 4);
must("precommits created after 2/3 prevote", round.precommits.length === 4);
must("round finalizes", round.result.finalized === true);
must("finality uses strict >2/3 rule", round.result.confirmedPower === 100 && round.result.finalized === true);

const weakPrevotes = [
  { validatorId: "v3", status: "confirmed" },
  { validatorId: "v4", status: "confirmed" },
];

const weakPrecommits = precommit(validators, round.proposal, weakPrevotes);
must("no precommit without 2/3 prevote", weakPrecommits.length === 0);

const weakFinalize = finalize(validators, round.proposal, weakPrecommits);
must("no finality without 2/3 precommit", weakFinalize.finalized === false);

console.log("ROUND-BASED CONSENSUS CHECK PASSED");
