function quorum(totalStake) {
  return Math.floor((totalStake * 2) / 3) + 1;
}

function livenessUnderOneThirdAttackScenario() {
  const validators = [
    { validatorId: "v1", stake: 40, behavior: "honest" },
    { validatorId: "v2", stake: 30, behavior: "honest" },
    { validatorId: "v3", stake: 30, behavior: "withhold_precommit" },
  ];

  const totalStake = validators.reduce((s, v) => s + v.stake, 0);
  const required = quorum(totalStake);

  const precommitPower = validators
    .filter(v => v.behavior === "honest")
    .reduce((s, v) => s + v.stake, 0);

  return {
    attack: "LIVENESS_UNDER_ONE_THIRD_ATTACK",
    totalStake,
    attackerStake: 30,
    required,
    precommitPower,
    finality: precommitPower >= required,
    defended: precommitPower >= required,
  };
}

function livenessAtOrAboveOneThirdLimitScenario() {
  const validators = [
    { validatorId: "v1", stake: 33, behavior: "honest" },
    { validatorId: "v2", stake: 33, behavior: "honest" },
    { validatorId: "v3", stake: 34, behavior: "withhold_precommit" },
  ];

  const totalStake = validators.reduce((s, v) => s + v.stake, 0);
  const required = quorum(totalStake);

  const precommitPower = validators
    .filter(v => v.behavior === "honest")
    .reduce((s, v) => s + v.stake, 0);

  return {
    attack: "BFT_ONE_THIRD_BOUNDARY",
    totalStake,
    attackerStake: 34,
    required,
    precommitPower,
    finality: precommitPower >= required,
    knownLimit: precommitPower < required,
  };
}

function lockDivergenceScenario() {
  const locks = {
    v1: "block-A",
    v2: "block-A",
    v3: "block-B",
    v4: "block-B",
  };

  const uniqueLocks = new Set(Object.values(locks));

  return {
    attack: "LOCK_DIVERGENCE",
    locks,
    divergent: uniqueLocks.size > 1,
    safeToFinalize: uniqueLocks.size === 1,
  };
}

function delayedEvidenceScenario() {
  const unbondingPeriod = 100;
  const evidenceDelay = 150;

  return {
    attack: "DELAYED_EVIDENCE",
    unbondingPeriod,
    evidenceDelay,
    slashable: evidenceDelay <= unbondingPeriod,
    vulnerable: evidenceDelay > unbondingPeriod,
  };
}

module.exports = {
  livenessUnderOneThirdAttackScenario,
  livenessAtOrAboveOneThirdLimitScenario,
  lockDivergenceScenario,
  delayedEvidenceScenario,
};
