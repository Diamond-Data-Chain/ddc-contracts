function detectDoubleSign(attestations) {
  const seen = new Map();
  const faults = [];

  for (const att of attestations) {
    const key = `${att.validatorId}:${att.branchId}`;

    if (seen.has(key)) {
      const prev = seen.get(key);

      if (
        prev.blockHash !== att.blockHash ||
        prev.status !== att.status
      ) {
        faults.push({
          validatorId: att.validatorId,
          branchId: att.branchId,
          fault: "DOUBLE_SIGN",
          penalty: "100%",
          evidence: [prev, att],
        });
      }
    } else {
      seen.set(key, att);
    }
  }

  return faults;
}

function applySlashing(validators, faults) {
  const out = { ...validators };

  for (const fault of faults) {
    const v = out[fault.validatorId];

    if (!v) continue;

    if (fault.fault === "DOUBLE_SIGN") {
      v.slashed += v.stake;
      v.stake = 0;
      v.active = false;
    }
  }

  return out;
}

module.exports = {
  detectDoubleSign,
  applySlashing,
};
