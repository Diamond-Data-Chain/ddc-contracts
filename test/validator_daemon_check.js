const fs = require("fs");
const os = require("os");
const path = require("path");
const { ValidatorDaemon } = require("../prototype/real-node/validator_daemon");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== VALIDATOR DAEMON CHECK ===");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ddc-validator-daemon-"));

const d1 = new ValidatorDaemon({
  validatorId: "validator-1",
  dataDir: dir,
});

const start = d1.start();

must("daemon starts", start.event === "DAEMON_STARTED");
must("daemon running", d1.status().running === true);

const m1 = d1.handleMessage({
  type: "PROPOSAL",
  height: 1,
  round: 0,
  blockHash: "block-A",
});

must("daemon accepts valid message", m1.accepted === true);
must("daemon advances height", d1.status().height === 1);
must("daemon tracks processed messages", d1.status().processedMessages === 1);

const stale = d1.handleMessage({
  type: "PREVOTE",
  height: 0,
  round: 5,
  blockHash: "old-block",
});

must("daemon rejects stale height", stale.accepted === false && stale.reason === "stale height");

d1.stop();

const d2 = new ValidatorDaemon({
  validatorId: "validator-1",
  dataDir: dir,
});

must("daemon state survives restart", d2.status().height === 1);
must("processed message count survives restart", d2.status().processedMessages === 1);

d2.start();

const m2 = d2.handleMessage({
  type: "PRECOMMIT",
  height: 1,
  round: 1,
  blockHash: "block-A",
});

must("daemon accepts higher round after restart", m2.accepted === true);
must("daemon round advances after restart", d2.status().round === 1);

let mismatchRejected = false;
try {
  new ValidatorDaemon({
    validatorId: "validator-evil",
    dataDir: dir,
  });
} catch (_) {
  mismatchRejected = true;
}

must("daemon rejects validator identity mismatch", mismatchRejected === true);

console.log("VALIDATOR DAEMON CHECK PASSED");
