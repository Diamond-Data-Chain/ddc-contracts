class ValidatorRegistry {
  constructor() {
    this.validators = new Map();
  }

  register({ validatorId, publicKeyPem, stake }) {
    if (!validatorId) throw new Error("validatorId required");
    if (!publicKeyPem) throw new Error("publicKey required");
    if (!stake || stake <= 0) throw new Error("stake required");
    if (this.validators.has(validatorId)) throw new Error("validator already registered");

    this.validators.set(validatorId, {
      validatorId,
      publicKeyPem,
      stake,
      slashed: 0,
      active: true,
    });
  }

  get(validatorId) {
    return this.validators.get(validatorId) || null;
  }

  isActive(validatorId) {
    const v = this.get(validatorId);
    return !!v && v.active && v.stake > 0;
  }

  slash(validatorId, amount) {
    const v = this.get(validatorId);
    if (!v) throw new Error("validator not found");

    const slashAmount = Math.min(v.stake, amount);
    v.stake -= slashAmount;
    v.slashed += slashAmount;

    if (v.stake === 0) {
      v.active = false;
    }
  }

  activeValidators() {
    return [...this.validators.values()].filter(v => v.active && v.stake > 0);
  }
}

module.exports = {
  ValidatorRegistry,
};
