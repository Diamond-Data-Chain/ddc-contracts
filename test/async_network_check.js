const { AsyncNetwork } = require("../prototype/real-node/async_network");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== ASYNC NETWORK CHECK ===");

let received = [];

const net = new AsyncNetwork({
  delayFn: () => Math.floor(Math.random() * 5),
  dropRate: 0,
});

net.registerNode("A", (msg, from) => {
  received.push({ msg, from });
});

net.send("B", "A", { id: 1 });
net.send("B", "A", { id: 2 });

must("messages queued", net.pending() === 2);

for (let i = 0; i < 10; i++) {
  net.tick(1);
}

must("messages delivered eventually", received.length === 2);

const netDrop = new AsyncNetwork({
  delayFn: () => 1,
  dropRate: 1,
});

netDrop.registerNode("A", () => {
  throw new Error("should not receive");
});

netDrop.send("B", "A", { id: 3 });

for (let i = 0; i < 5; i++) netDrop.tick(1);

must("dropped messages not delivered", netDrop.pending() === 0);

console.log("ASYNC NETWORK CHECK PASSED");
