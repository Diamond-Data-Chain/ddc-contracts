const { execSync } = require("child_process");

function run(scenario) {
  return execSync(`node prototype/real-node/three_node_finality.js ${scenario}`, {
    encoding: "utf8"
  });
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== 3-NODE FINALITY CHECK ===");

const normal = run("normal");
const attack = run("attack");

must("normal finality true", normal.includes('"finality": true'));
must("normal has 2 confirmations", normal.includes('"confirmed": 2'));
must("normal proof root exists", normal.includes('"proofRoot"'));

must("attack finality false", attack.includes('"finality": false'));
must("attack has 1 confirmation", attack.includes('"confirmed": 1'));
must("attack has rejection", attack.includes('"rejected": 1'));

console.log("3-NODE FINALITY CHECK PASSED");
