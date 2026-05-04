const {
  runChaosRound,
  runChaosSimulation,
} = require("../prototype/real-node/chaos_sim");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== CHAOS SIMULATION CHECK ===");

const sample = runChaosRound(42);

must("chaos round returns votes", Array.isArray(sample.votes));
must("chaos round does not double finalize", sample.doubleFinality === false);

const sim = runChaosSimulation(1000);

must("chaos simulation has no double finality", sim.passed === true);
must("chaos simulation executed 1000 rounds", sim.iterations === 1000);

console.log("CHAOS SIMULATION CHECK PASSED");
