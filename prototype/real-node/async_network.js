class AsyncNetwork {
  constructor(options = {}) {
    this.nodes = new Map();
    this.queue = [];

    this.delayFn = options.delayFn || (() => 0);
    this.dropRate = options.dropRate ?? 0;
    this.now = 0;
  }

  registerNode(nodeId, handler) {
    this.nodes.set(nodeId, handler);
  }

  send(from, to, message) {
    if (Math.random() < this.dropRate) {
      return { dropped: true };
    }

    const delay = this.delayFn();
    const deliverAt = this.now + delay;

    this.queue.push({
      from,
      to,
      message,
      deliverAt,
    });

    return { queued: true, delay };
  }

  tick(ms = 1) {
    this.now += ms;

    const deliverable = this.queue.filter(e => e.deliverAt <= this.now);
    this.queue = this.queue.filter(e => e.deliverAt > this.now);

    for (const e of deliverable) {
      const handler = this.nodes.get(e.to);
      if (handler) {
        handler(e.message, e.from);
      }
    }

    return deliverable.length;
  }

  pending() {
    return this.queue.length;
  }
}

module.exports = {
  AsyncNetwork,
};
