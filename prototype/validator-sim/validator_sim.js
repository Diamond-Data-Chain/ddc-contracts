#!/usr/bin/env node

const crypto = require("crypto");

const TOTAL_BRANCHES = 256;
const REQUIRED_CONFIRMATIONS = 172;

function hash(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function createValidators(count = 32) {
  return Array.from({ length: count }, (_, i) => ({
    id: `validator-${i + 1}`,
    stake: 10000 + i * 500,
    uptime: 0.96,
    reputation: 100,
    slashed: 0,
    active: true,
  }));
}

function weightedPick(validators, seed) {
  const active = validators.filter(v => v.active);
  const totalStake = active.reduce((s, v) => s + v.stake, 0);
  const r = parseInt(hash(seed).slice(0, 12), 16) % totalStake;

  let acc = 0;
  for (const v of active) {
    acc += v.stake;
    if (r < acc) return v;
  }
  return active[active.length - 1];
}

function assignBranches(validators, epochId) {
  const validatorSetRoot = hash(JSON.stringify(validators.map(v => [v.id, v.stake, v.active])));
  const seed = hash(`epoch:${epochId}:${validatorSetRoot}`);

  return Array.from({ length: TOTAL_BRANCHES }, (_, i) => {
    const branchId = i + 1;
    const validator = weightedPick(validators, `${seed}:${branchId}`);
    return { branchId, validatorId: validator.id };
  });
}

function simulateEpoch({ epochId, scenario }) {
  const validators = createValidators();
  const assignments = assignBranches(validators, epochId);

  let confirmed = 0;
  let rejected = 0;
  let timedOut = 0;
  const faults = [];

  for (const a of assignments) {
    const r = parseInt(hash(`${scenario}:${epochId}:${a.branchId}`).slice(0, 8), 16) / 0xffffffff;
    const validator = validators.find(v => v.id === a.validatorId);

    let status = "confirmed";

    if (scenario === "normal") {
      if (r > 0.86 && r <= 0.98) status = "rejected";
      if (r > 0.98) status = "timeout";
    }

    if (scenario === "attack_33") {
      if (r < 0.33) status = "rejected";
      else status = "confirmed";
    }

    if (scenario === "attack_50") {
      if (r < 0.50) status = "rejected";
      else status = "confirmed";
    }

    if (scenario === "downtime") {
      if (r < 0.25) status = "timeout";
      else if (r < 0.32) status = "rejected";
      else status = "confirmed";
    }

    if (status === "confirmed") confirmed++;
    if (status === "rejected") rejected++;
    if (status === "timeout") {
      timedOut++;
      validator.uptime -= 0.01;
      if (validator.uptime < 0.95) {
        validator.slashed += 0.05;
        faults.push({ validatorId: validator.id, fault: "downtime", slash: "5%" });
      }
    }
  }

  const finality = confirmed >= REQUIRED_CONFIRMATIONS;

  return {
    model: "DDC Validator Simulation",
    scenario,
    epochId,
    totalBranches: TOTAL_BRANCHES,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    confirmed,
    rejected,
    timedOut,
    finality,
    faults,
    validatorSummary: validators.slice(0, 8),
  };
}

const scenario = process.argv[2] || "normal";
const allowed = ["normal", "attack_33", "attack_50", "downtime"];

if (!allowed.includes(scenario)) {
  console.error(`Unknown scenario. Use: ${allowed.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify(simulateEpoch({ epochId: 1, scenario }), null, 2));
