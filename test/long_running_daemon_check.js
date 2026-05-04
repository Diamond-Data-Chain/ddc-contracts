const {
  runLongRunningDaemonSimulation,
} = require("../prototype/real-node/long_running_daemon_sim");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== LONG-RUNNING DAEMON CHECK ===");

const sim = runLongRunningDaemonSimulation(10000);

must("long-running simulation executed 10000 rounds", sim.rounds === 10000);
must("daemon processed messages", sim.accepted > 0);
must("daemon rejected some stale/invalid messages", sim.rejected > 0);
must("network queue did not explode", sim.noQueueExplosion === true);
must("daemon height remains monotonic and bounded", sim.monotonicHeight === true);
must("processed message count is sane", sim.processedReasonable === true);
must("daemon state survives restart after long run", sim.stateSurvivedRestart === true);

console.log("LONG-RUNNING DAEMON CHECK PASSED");
