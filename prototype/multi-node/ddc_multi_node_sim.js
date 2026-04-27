#!/usr/bin/env node

const { execSync } = require("child_process");

function runNode(scenario) {
  const out = execSync(`node prototype/mini-node/ddc_mini_node.js ${scenario}`, {
    encoding: "utf8",
  });
  return JSON.parse(out);
}

function simulateNetwork({ nodes = 3, scenario = "normal" }) {
  const results = [];

  for (let i = 0; i < nodes; i++) {
    results.push(runNode(scenario));
  }

  const finalized = results.filter(r => r.consensus.finality).length;

  return {
    network: "DDC Multi-Node Simulation",
    nodes,
    scenario,
    finalizedNodes: finalized,
    requiredMajority: Math.floor(nodes * 0.67),
    networkFinality: finalized >= Math.floor(nodes * 0.67),
    sample: results.map(r => ({
      blockHash: r.consensus.blockHash,
      finality: r.consensus.finality,
      confirmed: r.consensus.confirmed,
    })),
  };
}

const scenario = process.argv[2] || "normal";

console.log(JSON.stringify(simulateNetwork({ nodes: 5, scenario }), null, 2));
