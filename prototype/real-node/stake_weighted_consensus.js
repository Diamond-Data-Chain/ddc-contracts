function totalActiveStake(validators) {
  return validators
    .filter(v => v.active)
    .reduce((sum, v) => sum + v.stake, 0);
}

function votingPower(validators, attestations, status = "confirmed") {
  const byId = new Map(validators.map(v => [v.validatorId, v]));
  const seen = new Set();

  let power = 0;

  for (const att of attestations) {
    if (seen.has(att.validatorId)) continue;
    seen.add(att.validatorId);

    const v = byId.get(att.validatorId);
    if (!v || !v.active) continue;

    if (att.status === status) {
      power += v.stake;
    }
  }

  return power;
}

function hasTwoThirdsQuorum(validators, attestations) {
  const total = totalActiveStake(validators);
  const confirmedPower = votingPower(validators, attestations, "confirmed");
  const threshold = (total * 2) / 3;

  return {
    totalStake: total,
    confirmedPower,
    requiredPower: threshold,
    finality: confirmedPower > threshold,
  };
}

module.exports = {
  totalActiveStake,
  votingPower,
  hasTwoThirdsQuorum,
};
