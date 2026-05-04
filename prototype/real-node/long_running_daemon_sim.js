const fs = require("fs");
const os = require("os");
const path = require("path");
const { AsyncNetwork } = require("./async_network");
const { ValidatorDaemon } = require("./validator_daemon");

function runLongRunningDaemonSimulation(rounds = 10000) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ddc-long-running-"));

  const daemon = new ValidatorDaemon({
    validatorId: "validator-long",
    dataDir: dir,
  });

  daemon.start();

  const received = [];

  const net = new AsyncNetwork({
    delayFn: () => Math.floor(Math.random() * 3),
    dropRate: 0.01,
  });

  net.registerNode("validator-long", (msg, from) => {
    const result = daemon.handleMessage(msg);
    received.push({ from, msg, result });
  });

  let sent = 0;

  for (let i = 1; i <= rounds; i++) {
    const msg = {
      id: `msg-${i}`,
      type: i % 2 === 0 ? "PREVOTE" : "PRECOMMIT",
      height: i,
      round: i % 10,
      blockHash: `block-${i}`,
    };

    net.send("scheduler", "validator-long", msg);
    sent += 1;

    if (i % 100 === 0) {
      // stale attack
      net.send("attacker", "validator-long", {
        id: `stale-${i}`,
        type: "PREVOTE",
        height: Math.max(0, i - 500),
        round: 0,
        blockHash: "old-block",
      });
    }

    net.tick(1);
  }

  for (let i = 0; i < 100; i++) {
    net.tick(1);
  }

  const beforeRestart = daemon.status();
  daemon.stop();

  const restarted = new ValidatorDaemon({
    validatorId: "validator-long",
    dataDir: dir,
  });

  const afterRestart = restarted.status();

  const accepted = received.filter(r => r.result.accepted === true).length;
  const rejected = received.filter(r => r.result.accepted === false).length;

  return {
    rounds,
    sent,
    delivered: received.length,
    accepted,
    rejected,
    pending: net.pending(),
    beforeRestart,
    afterRestart,
    stateSurvivedRestart:
      beforeRestart.height === afterRestart.height &&
      beforeRestart.round === afterRestart.round &&
      beforeRestart.processedMessages === afterRestart.processedMessages,
    noQueueExplosion: net.pending() < 100,
    monotonicHeight: afterRestart.height > 0 && afterRestart.height <= rounds,
    processedReasonable:
      afterRestart.processedMessages > 0 &&
      afterRestart.processedMessages <= sent,
  };
}

module.exports = {
  runLongRunningDaemonSimulation,
};
