#!/usr/bin/env node

const net = require("net");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const nodeId = arg("id", `node-${Math.floor(Math.random() * 1000)}`);
const port = Number(arg("port", "0"));
const peer = arg("peer", null);
const duration = Number(arg("duration", "2000"));

const peers = new Set();

function log(event, data = {}) {
  console.log(JSON.stringify({ node: nodeId, event, ...data }));
}

function send(socket, msg) {
  socket.write(JSON.stringify(msg) + "\n");
}

function broadcast(msg, exclude = null) {
  for (const p of peers) {
    if (p.socket !== exclude) {
      send(p.socket, msg);
    }
  }
}

function handle(socket, msg) {
  if (msg.type === "HELLO") {
    peers.add({ id: msg.from, socket });
    log("PEER_ADDED", { peer: msg.from });

    send(socket, {
      type: "PEER_LIST",
      peers: [...peers].map(p => p.id),
    });
  }

  if (msg.type === "PEER_LIST") {
    log("PEER_LIST_RECEIVED", { peers: msg.peers });
  }

  if (msg.type === "GOSSIP") {
    log("GOSSIP_RECEIVED", { from: msg.from, data: msg.data });

    broadcast(msg, socket);
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
      handle(socket, JSON.parse(line));
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

      setTimeout(() => {
        const gossip = {
          type: "GOSSIP",
          from: nodeId,
          data: `message-from-${nodeId}`,
        };

        send(socket, gossip);
        log("GOSSIP_SENT", gossip);
      }, 200);
    });

    socket.setEncoding("utf8");
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        handle(socket, JSON.parse(line));
      }
    });
  }
});

setTimeout(() => {
  log("SHUTDOWN");
  server.close(() => process.exit(0));
}, duration);
