const { StakeManager } = require("../prototype/real-node/stake_manager");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== STAKE ECONOMICS CHECK ===");

const sm = new StakeManager();

sm.deposit("validator-1", 10000);

let s = sm.getStake("validator-1");
must("stake deposited", s.available === 10000);

sm.lock("validator-1", 8000);

s = sm.getStake("validator-1");
must("stake locked", s.locked === 8000);
must("remaining available correct", s.available === 2000);

let failed = false;
try {
  sm.withdraw("validator-1");
} catch {
  failed = true;
}
must("cannot withdraw while locked", failed);

sm.slash("validator-1");

s = sm.getStake("validator-1");
must("locked stake removed after slash", s.locked === 0);

const withdrawn = sm.withdraw("validator-1");
must("can withdraw after slash", withdrawn === 2000);

console.log("STAKE ECONOMICS CHECK PASSED");
