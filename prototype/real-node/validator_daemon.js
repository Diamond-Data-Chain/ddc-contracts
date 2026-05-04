#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { JsonStateStore } = require("./storage");

function now() {
  return new Date().toISOString();
}

class ValidatorDaemon {
  constructor({ validatorId, dataDir }) {
    if (!validatorId) throw new Error("validatorId required");
    if (!dataDir) throw new Error("dataDir required");

    this.validatorId = validatorId;
    this.store = new JsonStateStore(dataDir);

    this.state = this.store.load("daemon_state", {
      validatorId,
      height: 0,
      round: 0,
      running: false,
      startedAt: null,
      lastMessageAt: null,
      processedMessages: 0,
    });

    if (this.state.validatorId !== validatorId) {
      throw new Error("validator identity mismatch");
    }
  }

  start() {
    this.state.running = true;
    this.state.startedAt = this.state.startedAt || now();
    this.persist();

    return {
      event: "DAEMON_STARTED",
      validatorId: this.validatorId,
      height: this.state.height,
      round: this.state.round,
    };
  }

  stop() {
    this.state.running = false;
    this.persist();

    return {
      event: "DAEMON_STOPPED",
      validatorId: this.validatorId,
    };
  }

  persist() {
    this.store.save("daemon_state", this.state);
  }

  handleMessage(msg) {
    if (!this.state.running) {
      return { accepted: false, reason: "daemon not running" };
    }

    if (!msg || !msg.type) {
      return { accepted: false, reason: "invalid message" };
    }

    if (msg.height < this.state.height) {
      return { accepted: false, reason: "stale height" };
    }

    if (msg.height === this.state.height && msg.round < this.state.round) {
      return { accepted: false, reason: "stale round" };
    }

    this.state.height = msg.height;
    this.state.round = msg.round;
    this.state.lastMessageAt = now();
    this.state.processedMessages += 1;
    this.persist();

    this.store.append("message_log", {
      validatorId: this.validatorId,
      receivedAt: this.state.lastMessageAt,
      message: msg,
    });

    return {
      accepted: true,
      validatorId: this.validatorId,
      height: this.state.height,
      round: this.state.round,
      processedMessages: this.state.processedMessages,
    };
  }

  status() {
    return { ...this.state };
  }
}

if (require.main === module) {
  const validatorId = process.argv[2] || "validator-1";
  const dataDir = process.argv[3] || path.join(process.cwd(), ".ddc-validator");

  const daemon = new ValidatorDaemon({ validatorId, dataDir });
  console.log(JSON.stringify(daemon.start()));

  process.on("SIGTERM", () => {
    console.log(JSON.stringify(daemon.stop()));
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log(JSON.stringify(daemon.stop()));
    process.exit(0);
  });
}

module.exports = {
  ValidatorDaemon,
};
