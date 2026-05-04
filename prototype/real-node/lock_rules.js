const { hasTwoThirdsQuorum } = require("./stake_weighted_consensus");

class LockManager {
  constructor() {
    this.locks = new Map(); // validatorId → { blockHash, round }
  }

  lock(validatorId, blockHash, round) {
    const existing = this.locks.get(validatorId);

    if (!existing) {
      this.locks.set(validatorId, { blockHash, round });
      return true;
    }

    if (existing.blockHash === blockHash) {
      if (round >= existing.round) {
        this.locks.set(validatorId, { blockHash, round });
        return true;
      }
      return false;
    }

    // Different block: never override without explicit unlock proof.
    return false;
  }

  canVote(validatorId, blockHash) {
    const lock = this.locks.get(validatorId);
    if (!lock) return true;
    return lock.blockHash === blockHash;
  }

  canUnlock(validatorId, targetBlockHash, targetRound, validators, prevotes) {
    const existing = this.locks.get(validatorId);

    if (!existing) return true;
    if (existing.blockHash === targetBlockHash) return true;
    if (targetRound <= existing.round) return false;

    const sameBlockPrevotes = prevotes.filter(
      v =>
        v.blockHash === targetBlockHash &&
        v.round === targetRound &&
        v.status === "confirmed"
    );

    const quorum = hasTwoThirdsQuorum(validators, sameBlockPrevotes);

    return quorum.finality === true;
  }

  unlockAndRelock(validatorId, targetBlockHash, targetRound, validators, prevotes) {
    if (!this.canUnlock(validatorId, targetBlockHash, targetRound, validators, prevotes)) {
      return false;
    }

    this.locks.set(validatorId, {
      blockHash: targetBlockHash,
      round: targetRound,
    });

    return true;
  }

  getLock(validatorId) {
    return this.locks.get(validatorId) || null;
  }
}

module.exports = {
  LockManager,
};
