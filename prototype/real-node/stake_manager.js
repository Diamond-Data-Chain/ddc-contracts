class StakeManager {
  constructor() {
    this.stakes = new Map();
    this.locked = new Map();
  }

  deposit(validatorId, amount) {
    if (amount <= 0) throw new Error("invalid stake");

    const current = this.stakes.get(validatorId) || 0;
    this.stakes.set(validatorId, current + amount);
  }

  lock(validatorId, amount) {
    const current = this.stakes.get(validatorId) || 0;
    if (current < amount) throw new Error("insufficient stake");

    this.stakes.set(validatorId, current - amount);

    const locked = this.locked.get(validatorId) || 0;
    this.locked.set(validatorId, locked + amount);
  }

  slash(validatorId) {
    this.locked.set(validatorId, 0);
  }

  withdraw(validatorId) {
    const locked = this.locked.get(validatorId) || 0;
    if (locked > 0) throw new Error("stake still locked");

    const amount = this.stakes.get(validatorId) || 0;
    this.stakes.set(validatorId, 0);

    return amount;
  }

  getStake(validatorId) {
    return {
      available: this.stakes.get(validatorId) || 0,
      locked: this.locked.get(validatorId) || 0,
    };
  }
}

module.exports = {
  StakeManager,
};
