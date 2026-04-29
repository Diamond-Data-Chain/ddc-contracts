const { execSync } = require("child_process");

function run(name, cmd, checks = []) {
  console.log(`\n=== ${name} ===`);
  const out = execSync(cmd, { encoding: "utf8" });
  console.log(out.slice(0, 1200));

  for (const check of checks) {
    if (!out.includes(check)) {
      throw new Error(`${name} failed: missing "${check}"`);
    }
  }
}

run("Hardhat compile", "npx hardhat compile");

run(
  "DDC-256 protocol normal",
  "node prototype/ddc-256/ddc256_protocol_prototype.js normal",
  ['"finality": true', '"requiredConfirmations": 172']
);

run(
  "DDC-256 protocol attack",
  "node prototype/ddc-256/ddc256_protocol_prototype.js attack",
  ['"finality": false', '"requiredConfirmations": 172']
);

run(
  "Validator sim normal",
  "node prototype/validator-sim/validator_sim.js normal",
  ['"finality": true', '"requiredConfirmations": 172']
);

run(
  "Validator sim attack_50",
  "node prototype/validator-sim/validator_sim.js attack_50",
  ['"finality": false', '"requiredConfirmations": 172']
);

run(
  "Mini-node normal",
  "node prototype/mini-node/ddc_mini_node.js normal",
  ['"finality": true', '"requiredConfirmations": 172', '"mempoolRemaining": 0']
);

run(
  "Mini-node attack",
  "node prototype/mini-node/ddc_mini_node.js attack",
  ['"finality": false', '"requiredConfirmations": 172']
);


run(
  "Network flow normal",
  "node prototype/network-flow/ddc_network_flow.js normal",
  ['"finality": true', '"requiredConfirmations": 172', '"attestations": 256']
);

run(
  "Network flow attack",
  "node prototype/network-flow/ddc_network_flow.js attack",
  ['"finality": false', '"requiredConfirmations": 172']
);


run(
  "Presale rules static check",
  "node test/presale_rules_check.js",
  ["PRESALE RULES CHECK PASSED"]
);


run(
  "Presale economic math check",
  "node test/presale_economic_math_check.js",
  ["PRESALE ECONOMIC MATH CHECK PASSED"]
);


run(
  "Batch rollover timing check",
  "node test/batch_rollover_timing_check.js",
  ["BATCH ROLLOVER / TIMING CHECK PASSED"]
);


run(
  "Finalize treasury liveness check",
  "node test/finalize_liveness_check.js",
  ["FINALIZE / TREASURY LIVENESS CHECK PASSED"]
);


run(
  "Data layer validation check",
  "node test/data_layer_check.js",
  ["DATA LAYER VALIDATION CHECK PASSED"]
);


run(
  "Consensus attack check",
  "node test/consensus_attack_check.js",
  ["CONSENSUS ATTACK CHECK PASSED"]
);


run(
  "Validator fairness and stake splitting check",
  "node test/validator_fairness_check.js",
  ["VALIDATOR FAIRNESS / STAKE SPLITTING CHECK PASSED"]
);


run(
  "Validator downtime impact check",
  "node test/validator_downtime_check.js",
  ["VALIDATOR DOWNTIME IMPACT CHECK PASSED"]
);


run(
  "Node basic check",
  "node test/node_basic_check.js",
  ["NODE BASIC CHECK PASSED"]
);


run(
  "Node P2P message exchange check",
  "node test/node_p2p_check.js",
  ["NODE P2P CHECK PASSED"]
);


run(
  "3-node finality aggregation check",
  "node test/node_three_finality_check.js",
  ["3-NODE FINALITY CHECK PASSED"]
);


run(
  "Validator cryptographic signature check",
  "node test/validator_signature_check.js",
  ["VALIDATOR SIGNATURE CHECK PASSED"]
);


run(
  "Slashing double-sign check",
  "node test/slashing_check.js",
  ["SLASHING CHECK PASSED"]
);

console.log("\nALL TESTS PASSED");
