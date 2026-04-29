#!/usr/bin/env node

const net = require("net");
const crypto = require("crypto");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const nodeId = arg("id", `node-${Math.floor(Math.random() * 1000)}`);
const port = Number(arg("port", "0"));
const peer = arg("peer", null);
const propose = process.argv.includes("--propose");
const duration = Number(arg("duration", "1500"));

function hash(x) {
  return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
}

function log(event, data = {}) {
  console.log(JSON.stringify({ node: nodeId, event, ...data }));
}

function send(socket, msg) {
  socket.write(JSON.stringify(msg) + "\n");
}

function makeBlock() {
  const block = {
    height: 1,
    proposer: nodeId,
    timestamp: new Date().toISOString(),
    txs: [
      { from: "account-1", to: "account-2", amount: "10", nonce: 1 }
    ]
  };
  return { ...block, blockHash: hash(block) };
}

function handleMessage(socket, msg) {
  if (msg.type === "HELLO") {
    log("HELLO_RECEIVED", { from: msg.from });
  }

  if (msg.type === "BLOCK_PROPOSAL") {
    log("BLOCK_RECEIVED", { from: msg.from, blockHash: msg.block.blockHash });

    const attestation = {
      type: "BRANCH_ATTESTATION",
      from: nodeId,
      blockHash: msg.block.blockHash,
      branchId: 1,
      status: "confirmed",
      signature: hash(`${nodeId}:${msg.block.blockHash}:confirmed`)
    };

    send(socket, attestation);
    log("ATTESTATION_SENT", { to: msg.from, blockHash: msg.block.blockHash });
  }

  if (msg.type === "BRANCH_ATTESTATION") {
    log("ATTESTATION_RECEIVED", {
      from: msg.from,
      blockHash: msg.blockHash,
      status: msg.status
    });
  }
}

const server = net.createServer((socket) => {
  socket.setEncoding("utf8");
  let buffer = "";

  socket.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      handleMessage(socket, JSON.parse(line));
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  log("LISTENING", { port: address.port });

  if (peer) {
    const [host, peerPort] = peer.split(":");
    const socket = net.createConnection({ host, port: Number(peerPort) }, () => {
      send(socket, { type: "HELLO", from: nodeId });
      log("HELLO_SENT", { to: peer });

      if (propose) {
        const block = makeBlock();
        send(socket, { type: "BLOCK_PROPOSAL", from: nodeId, block });
        log("BLOCK_SENT", { to: peer, blockHash: block.blockHash });
      }
    });

    socket.setEncoding("utf8");
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        handleMessage(socket, JSON.parse(line));
      }
    });
  }
});

setTimeout(() => {
  log("SHUTDOWN");
  server.close(() => process.exit(0));
}, duration);
