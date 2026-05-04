class PeerScoring {
  constructor(options = {}) {
    this.peers = new Map();

    this.defaults = {
      startScore: options.startScore ?? 100,
      minScore: options.minScore ?? 0,
      banScore: options.banScore ?? 30,
      maxMessagesPerWindow: options.maxMessagesPerWindow ?? 20,
      windowMs: options.windowMs ?? 1000,
      duplicatePenalty: options.duplicatePenalty ?? 5,
      invalidPenalty: options.invalidPenalty ?? 25,
      stalePenalty: options.stalePenalty ?? 10,
      spamPenalty: options.spamPenalty ?? 20,
      goodMessageReward: options.goodMessageReward ?? 1,
    };
  }

  ensure(peerId) {
    if (!this.peers.has(peerId)) {
      this.peers.set(peerId, {
        peerId,
        score: this.defaults.startScore,
        banned: false,
        seenMessages: new Set(),
        windowStart: 0,
        messageCount: 0,
      });
    }

    return this.peers.get(peerId);
  }

  isBanned(peerId) {
    return this.ensure(peerId).banned === true;
  }

  score(peerId) {
    return this.ensure(peerId).score;
  }

  penalize(peerId, amount, reason) {
    const p = this.ensure(peerId);
    p.score = Math.max(this.defaults.minScore, p.score - amount);

    if (p.score <= this.defaults.banScore) {
      p.banned = true;
    }

    return {
      accepted: false,
      peerId,
      reason,
      score: p.score,
      banned: p.banned,
    };
  }

  reward(peerId) {
    const p = this.ensure(peerId);
    p.score = Math.min(this.defaults.startScore, p.score + this.defaults.goodMessageReward);
  }

  acceptMessage(peerId, message, nowMs) {
    const p = this.ensure(peerId);

    if (p.banned) {
      return { accepted: false, peerId, reason: "peer banned", score: p.score, banned: true };
    }

    if (!message || !message.id || !message.type) {
      return this.penalize(peerId, this.defaults.invalidPenalty, "invalid message");
    }

    if (p.windowStart === 0 || nowMs - p.windowStart > this.defaults.windowMs) {
      p.windowStart = nowMs;
      p.messageCount = 0;
    }

    p.messageCount += 1;

    if (p.messageCount > this.defaults.maxMessagesPerWindow) {
      return this.penalize(peerId, this.defaults.spamPenalty, "rate limit exceeded");
    }

    if (p.seenMessages.has(message.id)) {
      return this.penalize(peerId, this.defaults.duplicatePenalty, "duplicate message");
    }

    p.seenMessages.add(message.id);

    if (message.stale === true) {
      return this.penalize(peerId, this.defaults.stalePenalty, "stale message");
    }

    this.reward(peerId);

    return {
      accepted: true,
      peerId,
      score: p.score,
      banned: p.banned,
    };
  }

  eligiblePeers() {
    return [...this.peers.values()]
      .filter(p => !p.banned && p.score > this.defaults.banScore)
      .map(p => p.peerId);
  }
}

function eclipseDefenseCheck(peers, minDistinctGroups = 3) {
  const active = peers.filter(p => !p.banned);
  const groups = new Set(active.map(p => p.group));

  return {
    activePeers: active.length,
    distinctGroups: groups.size,
    defended: groups.size >= minDistinctGroups,
  };
}

module.exports = {
  PeerScoring,
  eclipseDefenseCheck,
};
