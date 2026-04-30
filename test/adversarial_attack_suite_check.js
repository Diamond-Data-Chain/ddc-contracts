const {
  livenessUnderOneThirdAttackScenario,
  livenessAtOrAboveOneThirdLimitScenario,
  lockDivergenceScenario,
  delayedEvidenceScenario,
} = require("../prototype/real-node/adversarial_tests");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== ADVERSARIAL ATTACK SUITE CHECK ===");

const under = livenessUnderOneThirdAttackScenario();
must("system preserves finality below one-third Byzantine stake", under.defended === true);
must("under-one-third attacker cannot stop finality", under.finality === true);

const boundary = livenessAtOrAboveOneThirdLimitScenario();
must("one-third boundary is detected as BFT liveness limit", boundary.knownLimit === true);
must("system does not falsely claim finality at one-third boundary", boundary.finality === false);

const lock = lockDivergenceScenario();
must("lock divergence detected", lock.divergent === true);
must("lock divergence blocks safe finality", lock.safeToFinalize === false);

const delayed = delayedEvidenceScenario();
must("delayed evidence vulnerability detected", delayed.vulnerable === true);
must("delayed evidence not slashable after window", delayed.slashable === false);

console.log("ADVERSARIAL ATTACK SUITE CHECK PASSED");
