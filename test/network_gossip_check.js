const { spawn } = require("child_process");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

function run() {
  return new Promise((resolve, reject) => {
    let outA = "", outB = "", outC = "";

    const A = spawn("node", [
      "prototype/real-node/gossip_node.js",
      "--id", "A",
      "--port", "20001",
      "--duration", "2500"
    ]);

    const B = spawn("node", [
      "prototype/real-node/gossip_node.js",
      "--id", "B",
      "--port", "20002",
      "--peer", "127.0.0.1:20001",
      "--duration", "2000"
    ]);

    const C = spawn("node", [
      "prototype/real-node/gossip_node.js",
      "--id", "C",
      "--port", "20003",
      "--peer", "127.0.0.1:20002",
      "--duration", "1500"
    ]);

    A.stdout.on("data", d => outA += d.toString());
    B.stdout.on("data", d => outB += d.toString());
    C.stdout.on("data", d => outC += d.toString());

    let done = 0;
    function finish() {
      done++;
      if (done === 3) resolve({ outA, outB, outC });
    }

    A.on("exit", finish);
    B.on("exit", finish);
    C.on("exit", finish);

    A.on("error", reject);
    B.on("error", reject);
    C.on("error", reject);
  });
}

(async () => {
  console.log("=== NETWORK GOSSIP CHECK ===");

  const { outA, outB, outC } = await run();

  must("node A listens", outA.includes('"event":"LISTENING"'));
  must("node B connects to A", outB.includes('"event":"HELLO_SENT"'));
  must("node C connects to B", outC.includes('"event":"HELLO_SENT"'));

  must("gossip sent", outB.includes('"event":"GOSSIP_SENT"'));
  must("gossip propagated to A or C",
    outA.includes("GOSSIP_RECEIVED") || outC.includes("GOSSIP_RECEIVED")
  );

  console.log("NETWORK GOSSIP CHECK PASSED");
})();
