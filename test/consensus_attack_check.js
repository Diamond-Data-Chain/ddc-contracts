const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== CONSENSUS ATTACK CHECK ===");

// normal scenario
const normal = run("node prototype/ddc-256/ddc256_protocol_prototype.js normal");

// attack scenario (simulate 50% malicious)
const attack = run("node prototype/ddc-256/ddc256_protocol_prototype.js attack");

// checks
must("normal scenario reaches finality", normal.includes('"finality": true'));
must("attack scenario breaks finality", attack.includes('"finality": false'));

// edge: confirmations threshold respected
must(
  "normal confirmations above threshold",
  /"confirmed":\s*(1[7-9]\d|2\d\d)/.test(normal)
);

must(
  "attack confirmations below threshold",
  /"confirmed":\s*(1[0-6]\d|[0-9]\d)/.test(attack)
);

console.log("CONSENSUS ATTACK CHECK PASSED");
