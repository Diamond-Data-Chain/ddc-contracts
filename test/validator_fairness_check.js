const crypto = require("crypto");

function hash(x) {
  return crypto.createHash("sha256").update(String(x)).digest("hex");
}

function pick(validators, seed) {
  const totalStake = validators.reduce((s, v) => s + v.stake, 0);
  const r = parseInt(hash(seed).slice(0, 12), 16) % totalStake;

  let acc = 0;
  for (const v of validators) {
    acc += v.stake;
    if (r < acc) return v.id;
  }
  return validators[validators.length - 1].id;
}

function simulate(validators, rounds = 10000) {
  const counts = {};
  for (const v of validators) counts[v.id] = 0;

  for (let i = 0; i < rounds; i++) {
    const id = pick(validators, `round-${i}`);
    counts[id]++;
  }

  return counts;
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VALIDATOR FAIRNESS / STAKE SPLITTING CHECK ===");

const balanced = [
  { id: "v1", stake: 100 },
  { id: "v2", stake: 100 },
  { id: "v3", stake: 100 },
  { id: "v4", stake: 100 },
];

const balancedCounts = simulate(balanced);

for (const id of Object.keys(balancedCounts)) {
  const share = balancedCounts[id] / 10000;
  must(`balanced validator ${id} within expected range`, share > 0.20 && share < 0.30);
}

const singleWhale = [
  { id: "whale", stake: 100 },
  { id: "small1", stake: 10 },
  { id: "small2", stake: 10 },
  { id: "small3", stake: 10 },
  { id: "small4", stake: 10 },
];

const whaleCounts = simulate(singleWhale);
const whaleShare = whaleCounts.whale / 10000;
must("larger stake gets proportionally larger selection share", whaleShare > 0.65 && whaleShare < 0.80);

const oneValidator = [
  { id: "A", stake: 100 },
  { id: "B", stake: 100 },
];

const splitValidator = [
  { id: "A1", stake: 50 },
  { id: "A2", stake: 50 },
  { id: "B", stake: 100 },
];

const oneCounts = simulate(oneValidator);
const splitCounts = simulate(splitValidator);

const oneShareA = oneCounts.A / 10000;
const splitShareA = (splitCounts.A1 + splitCounts.A2) / 10000;

must("stake splitting does not materially increase total selection share", Math.abs(oneShareA - splitShareA) < 0.03);

console.log("VALIDATOR FAIRNESS / STAKE SPLITTING CHECK PASSED");
