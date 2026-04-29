function simulateDowntime(totalBranches, offlinePercent) {
  const offlineBranches = Math.floor((totalBranches * offlinePercent) / 100);
  const activeBranches = totalBranches - offlineBranches;

  return {
    totalBranches,
    offlinePercent,
    activeBranches,
    requiredConfirmations: 172,
    finality: activeBranches >= 172,
  };
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VALIDATOR DOWNTIME IMPACT CHECK ===");

const lowDowntime = simulateDowntime(256, 20);
must("20% downtime still reaches finality", lowDowntime.finality === true);

const boundaryDowntime = simulateDowntime(256, 32);
must("32% downtime still reaches finality at boundary", boundaryDowntime.finality === true);

const highDowntime = simulateDowntime(256, 40);
must("40% downtime prevents finality", highDowntime.finality === false);

must("finality threshold remains 172", highDowntime.requiredConfirmations === 172);

console.log("VALIDATOR DOWNTIME IMPACT CHECK PASSED");
