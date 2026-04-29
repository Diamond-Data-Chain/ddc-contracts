const {
  commit,
  reveal,
  deriveRandomness,
  selectValidator,
} = require("../prototype/real-node/vrf");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VRF RANDOMNESS CHECK ===");

const secrets = ["s1", "s2", "s3"];
const commits = secrets.map(commit);

must("commit-reveal valid", reveal("s1", commits[0]) === true);
must("invalid reveal rejected", reveal("fake", commits[0]) === false);

const randomness1 = deriveRandomness(secrets);
const randomness2 = deriveRandomness([...secrets].reverse());

must("randomness deterministic regardless of order", randomness1 === randomness2);

const validators = [
  { id: "A", stake: 100 },
  { id: "B", stake: 100 },
  { id: "C", stake: 100 },
];

const selected = selectValidator(validators, randomness1);

must("validator selected exists", ["A","B","C"].includes(selected));

console.log("VRF RANDOMNESS CHECK PASSED");
