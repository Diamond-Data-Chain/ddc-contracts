const { verifyDoubleSignEvidence, applyEvidenceSlash } = require("./slashing_evidence");

class EvidencePool {
  constructor(registry) {
    this.registry = registry;
    this.seen = new Set();
    this.accepted = [];
    this.rejected = [];
  }

  receive(evidence) {
    if (!evidence || !evidence.evidenceHash) {
      this.rejected.push({ reason: "missing evidenceHash" });
      return { accepted: false, reason: "missing evidenceHash" };
    }

    if (this.seen.has(evidence.evidenceHash)) {
      return { accepted: false, reason: "duplicate evidence" };
    }

    this.seen.add(evidence.evidenceHash);

    if (!verifyDoubleSignEvidence(evidence, this.registry)) {
      this.rejected.push({ evidenceHash: evidence.evidenceHash, reason: "invalid evidence" });
      return { accepted: false, reason: "invalid evidence" };
    }

    const slashResult = applyEvidenceSlash(evidence, this.registry);

    this.accepted.push({
      evidenceHash: evidence.evidenceHash,
      validatorId: evidence.validatorId,
      slashed: slashResult.slashed,
    });

    return {
      accepted: true,
      gossip: true,
      evidenceHash: evidence.evidenceHash,
      validatorId: evidence.validatorId,
    };
  }
}

module.exports = {
  EvidencePool,
};
