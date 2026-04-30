class LockManager {
  constructor() {
    this.locks = new Map(); // validatorId → { blockHash, round }
  }

  lock(validatorId, blockHash, round) {
    const existing = this.locks.get(validatorId);

    // nema locka → postavi
    if (!existing) {
      this.locks.set(validatorId, { blockHash, round });
      return;
    }

    // isti blok → može update runde
    if (existing.blockHash === blockHash) {
      if (round >= existing.round) {
        this.locks.set(validatorId, { blockHash, round });
      }
      return;
    }

    // DRUGI BLOK:
    // dozvoljeno SAMO ako je veća runda (unlock scenario)
    if (round > existing.round) {
      this.locks.set(validatorId, { blockHash, round });
    }
    // ako je ista runda → IGNORIŠI (KRITIČNO)
  }

  canVote(validatorId, blockHash) {
    const lock = this.locks.get(validatorId);

    if (!lock) return true;

    return lock.blockHash === blockHash;
  }

  getLock(validatorId) {
    return this.locks.get(validatorId) || null;
  }
}

module.exports = {
  LockManager,
};
