#!/usr/bin/env node

const crypto = require("crypto");

const TOTAL_BRANCHES = 256;
const REQUIRED_CONFIRMATIONS = Math.ceil(TOTAL_BRANCHES * 0.67); // 172

function hash(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function simulateValidation({ txPayload, honestRate = 0.8, timeoutRate = 0.02 }) {
  const txHash = hash(JSON.stringify(txPayload));
  const branches = [];

  let confirmed = 0;
  let rejected = 0;
  let timedOut = 0;

  for (let i = 0; i < TOTAL_BRANCHES; i++) {
    const branchId = i + 1;
    const branchSeed = hash(`${txHash}:${branchId}`);
    const r = parseInt(branchSeed.slice(0, 8), 16) / 0xffffffff;

    let status;
    if (r < timeoutRate) {
      status = "timeout";
      timedOut++;
    } else if (r < honestRate) {
      status = "confirmed";
      confirmed++;
    } else {
      status = "rejected";
      rejected++;
    }

    branches.push({
      branchId,
      branchHash: hash(`${txHash}:${branchId}:${status}`),
      status,
    });
  }

  return {
    model: "DDC-256 Branch Validation Model",
    txHash,
    totalBranches: TOTAL_BRANCHES,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    confirmed,
    rejected,
    timedOut,
    valid: confirmed >= REQUIRED_CONFIRMATIONS,
    branches,
  };
}

function main() {
  const scenario = process.argv[2] || "normal";

  const scenarios = {
    normal: { honestRate: 0.82, timeoutRate: 0.02 },
    weak: { honestRate: 0.66, timeoutRate: 0.03 },
    attack: { honestRate: 0.55, timeoutRate: 0.03 },
    high_timeout: { honestRate: 0.8, timeoutRate: 0.2 },
  };

  if (!scenarios[scenario]) {
    console.error(`Unknown scenario: ${scenario}`);
    console.error(`Available: ${Object.keys(scenarios).join(", ")}`);
    process.exit(1);
  }

  const txPayload = {
    from: "ddc_sender_demo",
    to: "ddc_receiver_demo",
    amount: "100",
    nonce: 1,
    dataHash: hash("example-dataset-reference"),
    timestamp: new Date().toISOString(),
  };

  const result = simulateValidation({
    txPayload,
    ...scenarios[scenario],
  });

  console.log(JSON.stringify(result, null, 2));
}

main();
