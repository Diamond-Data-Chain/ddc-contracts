const crypto = require("crypto");

function hash(x) {
  return crypto.createHash("sha256").update(x).digest("hex");
}

// commit faza
function commit(secret) {
  return hash(secret);
}

// reveal faza
function reveal(secret, commitment) {
  return hash(secret) === commitment;
}

// zajednički randomness
function deriveRandomness(secrets) {
  const combined = secrets.sort().join("|");
  return hash(combined);
}

// validator selection
function selectValidator(validators, randomness) {
  const totalStake = validators.reduce((s, v) => s + v.stake, 0);
  const r = parseInt(randomness.slice(0, 12), 16) % totalStake;

  let acc = 0;
  for (const v of validators) {
    acc += v.stake;
    if (r < acc) return v.id;
  }

  return validators[validators.length - 1].id;
}

module.exports = {
  commit,
  reveal,
  deriveRandomness,
  selectValidator,
};
