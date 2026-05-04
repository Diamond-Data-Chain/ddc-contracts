const { hasTwoThirdsQuorum } = require("./stake_weighted_consensus");

function seededRandom(seed) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

function makeValidators() {
  return [
    { validatorId: "v1", stake: 25, active: true },
    { validatorId: "v2", stake: 25, active: true },
    { validatorId: "v3", stake: 25, active: true },
    { validatorId: "v4", stake: 25, active: true },
  ];
}

function runChaosRound(seed) {
  const rnd = seededRandom(seed);
  const validators = makeValidators();

  const byzantine = new Set();
  if (rnd() < 0.5) byzantine.add("v4"); // max 25%, below 1/3

  const blocks = ["block-A", "block-B"];
  const votes = [];

  for (const v of validators) {
    const delayed = rnd() < 0.15;
    const dropped = rnd() < 0.10;

    if (dropped) continue;

    if (byzantine.has(v.validatorId)) {
      votes.push({
        validatorId: v.validatorId,
        blockHash: blocks[Math.floor(rnd() * blocks.length)],
        status: "confirmed",
        delayed,
      });
      continue;
    }

    votes.push({
      validatorId: v.validatorId,
      blockHash: "block-A",
      status: "confirmed",
      delayed,
    });
  }

  const blockAVotes = votes.filter(v => v.blockHash === "block-A");
  const blockBVotes = votes.filter(v => v.blockHash === "block-B");

  const blockA = hasTwoThirdsQuorum(validators, blockAVotes);
  const blockB = hasTwoThirdsQuorum(validators, blockBVotes);

  const doubleFinality = blockA.finality && blockB.finality;
  const honestOnlineStake = validators
    .filter(v => !byzantine.has(v.validatorId))
    .reduce((s, v) => s + v.stake, 0);

  return {
    seed,
    byzantine: [...byzantine],
    votes,
    blockA,
    blockB,
    doubleFinality,
    livenessPossible: honestOnlineStake > (100 * 2) / 3,
  };
}

function runChaosSimulation(iterations = 500) {
  const failures = [];

  for (let i = 1; i <= iterations; i++) {
    const r = runChaosRound(i);

    if (r.doubleFinality) {
      failures.push({
        seed: i,
        failure: "DOUBLE_FINALITY",
        result: r,
      });
    }
  }

  return {
    iterations,
    failures,
    passed: failures.length === 0,
  };
}

module.exports = {
  runChaosRound,
  runChaosSimulation,
};
