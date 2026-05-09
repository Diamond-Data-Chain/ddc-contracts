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
  "Batch rollover idempotency check",
  "node test/batch_rollover_idempotency_check.js",
  ["BATCH ROLLOVER IDEMPOTENCY CHECK PASSED"]
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


run(
  "Validator registry check",
  "node test/validator_registry_check.js",
  ["VALIDATOR REGISTRY CHECK PASSED"]
);


run(
  "Storage persistence check",
  "node test/storage_persistence_check.js",
  ["STORAGE PERSISTENCE CHECK PASSED"]
);


run(
  "Fork choice check",
  "node test/fork_choice_check.js",
  ["FORK CHOICE CHECK PASSED"]
);


run(
  "Network gossip check",
  "node test/network_gossip_check.js",
  ["NETWORK GOSSIP CHECK PASSED"]
);


run(
  "VRF randomness check",
  "node test/vrf_randomness_check.js",
  ["VRF RANDOMNESS CHECK PASSED"]
);


run(
  "Global slashing evidence check",
  "node test/slashing_evidence_check.js",
  ["GLOBAL SLASHING EVIDENCE CHECK PASSED"]
);


run(
  "Evidence gossip check",
  "node test/evidence_gossip_check.js",
  ["EVIDENCE GOSSIP CHECK PASSED"]
);


run(
  "Stake economics check",
  "node test/stake_economics_check.js",
  ["STAKE ECONOMICS CHECK PASSED"]
);


run(
  "Stake-weighted consensus check",
  "node test/stake_weighted_consensus_check.js",
  ["STAKE-WEIGHTED CONSENSUS CHECK PASSED"]
);


run(
  "Round-based consensus check",
  "node test/round_consensus_check.js",
  ["ROUND-BASED CONSENSUS CHECK PASSED"]
);


run(
  "Adversarial attack suite check",
  "node test/adversarial_attack_suite_check.js",
  ["ADVERSARIAL ATTACK SUITE CHECK PASSED"]
);


run(
  "Lock rules check",
  "node test/lock_rules_check.js",
  ["LOCK RULES CHECK PASSED"]
);


run(
  "Network attack simulation check",
  "node test/network_attack_sim_check.js",
  ["NETWORK ATTACK SIMULATION CHECK PASSED"]
);


run(
  "Chaos simulation check",
  "node test/chaos_sim_check.js",
  ["CHAOS SIMULATION CHECK PASSED"]
);


run(
  "Partition fork merge check",
  "node test/partition_fork_merge_check.js",
  ["PARTITION FORK MERGE CHECK PASSED"]
);


run(
  "Validator daemon check",
  "node test/validator_daemon_check.js",
  ["VALIDATOR DAEMON CHECK PASSED"]
);


run(
  "Peer scoring check",
  "node test/peer_scoring_check.js",
  ["PEER SCORING CHECK PASSED"]
);


run(
  "Async network check",
  "node test/async_network_check.js",
  ["ASYNC NETWORK CHECK PASSED"]
);


run(
  "Long-running daemon check",
  "node test/long_running_daemon_check.js",
  ["LONG-RUNNING DAEMON CHECK PASSED"]
);


run(
  "P2P socket node check",
  "node test/p2p_socket_node_check.js",
  ["P2P SOCKET NODE CHECK PASSED"]
);

console.log("\nALL TESTS PASSED");
