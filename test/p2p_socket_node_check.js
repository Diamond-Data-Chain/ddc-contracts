const net = require("net");
const { P2PSocketNode } = require("../prototype/real-node/p2p_socket_node");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

async function main() {
  console.log("=== P2P SOCKET NODE CHECK ===");

  const nodeA = new P2PSocketNode({ nodeId: "node-A", port: 0 });
  const nodeB = new P2PSocketNode({ nodeId: "node-B", port: 0 });

  await nodeA.start();
  await nodeB.start();

  must("node A listens on TCP", nodeA.status().port > 0);
  must("node B listens on TCP", nodeB.status().port > 0);

  await nodeB.connect("node-A", nodeA.status().port);

  await sleep(100);

  must(
    "node A receives HELLO over socket",
    nodeA.received.some(r => r.message && r.message.type === "HELLO")
  );

  const sent = nodeB.send("node-A", {
    id: "proposal-1",
    type: "PROPOSAL",
    height: 1,
    round: 0,
    blockHash: "block-A",
  });

  must("node B sends proposal over socket", sent === true);

  await sleep(100);

  must(
    "node A receives proposal over socket",
    nodeA.received.some(r => r.message && r.message.id === "proposal-1")
  );

  const raw = net.createConnection({ host: "127.0.0.1", port: nodeA.status().port });

  raw.write(JSON.stringify({
    id: "bad-1",
    from: "evil-peer",
  }) + "\n");

  raw.write("not-json\n");

  await sleep(150);

  must(
    "node A rejects invalid socket message",
    nodeA.received.some(r => r.rejected === true)
  );

  raw.destroy();

  await nodeA.stop();
  await nodeB.stop();

  console.log("P2P SOCKET NODE CHECK PASSED");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
