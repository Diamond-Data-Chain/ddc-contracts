const net = require("net");
const { PeerScoring } = require("./peer_scoring");

class P2PSocketNode {
  constructor({ nodeId, port = 0, host = "127.0.0.1" }) {
    if (!nodeId) throw new Error("nodeId required");

    this.nodeId = nodeId;
    this.host = host;
    this.port = port;
    this.server = null;
    this.peers = new Map();
    this.received = [];
    this.peerScoring = new PeerScoring({
      maxMessagesPerWindow: 50,
      banScore: 30,
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = net.createServer(socket => {
        this._setupSocket(socket);
      });

      this.server.on("error", reject);

      this.server.listen(this.port, this.host, () => {
        this.port = this.server.address().port;
        resolve({
          nodeId: this.nodeId,
          host: this.host,
          port: this.port,
        });
      });
    });
  }

  connect(peerId, port, host = "127.0.0.1") {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port }, () => {
        this._setupSocket(socket, peerId);
        this.send(peerId, {
          id: `${this.nodeId}-hello-${Date.now()}`,
          type: "HELLO",
          from: this.nodeId,
        });
        resolve(true);
      });

      socket.on("error", reject);
    });
  }

  _setupSocket(socket, peerId = null) {
    socket.setEncoding("utf8");

    const id = peerId || `peer-${Date.now()}-${Math.random()}`;
    this.peers.set(id, socket);

    let buffer = "";

    socket.on("data", chunk => {
      buffer += chunk;

      while (buffer.includes("\n")) {
        const idx = buffer.indexOf("\n");
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);

        if (!line.trim()) continue;

        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          this.peerScoring.acceptMessage(id, null, Date.now());
          continue;
        }

        const peerKey = msg.from || id;

        if (msg.from && !this.peers.has(msg.from)) {
          this.peers.set(msg.from, socket);
        }

        const scoring = this.peerScoring.acceptMessage(peerKey, msg, Date.now());

        if (!scoring.accepted) {
          this.received.push({
            from: peerKey,
            rejected: true,
            reason: scoring.reason,
            message: msg,
          });
          continue;
        }

        this.received.push({
          from: peerKey,
          rejected: false,
          message: msg,
        });
      }
    });

    socket.on("close", () => {
      for (const [k, v] of this.peers.entries()) {
        if (v === socket) this.peers.delete(k);
      }
    });
  }

  send(peerId, message) {
    const socket = this.peers.get(peerId);
    if (!socket) {
      return false;
    }

    socket.write(JSON.stringify({
      ...message,
      from: this.nodeId,
    }) + "\n");

    return true;
  }

  broadcast(message) {
    let sent = 0;

    for (const peerId of this.peers.keys()) {
      if (this.peerScoring.isBanned(peerId)) continue;
      if (this.send(peerId, message)) sent += 1;
    }

    return sent;
  }

  status() {
    return {
      nodeId: this.nodeId,
      port: this.port,
      peers: [...this.peers.keys()],
      received: this.received.length,
      bannedPeers: [...this.peerScoring.peers.values()]
        .filter(p => p.banned)
        .map(p => p.peerId),
    };
  }

  stop() {
    for (const socket of this.peers.values()) {
      socket.destroy();
    }

    this.peers.clear();

    return new Promise(resolve => {
      if (!this.server) return resolve();
      this.server.close(() => resolve());
    });
  }
}

module.exports = {
  P2PSocketNode,
};
