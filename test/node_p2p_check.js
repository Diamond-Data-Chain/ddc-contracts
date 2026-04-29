const { spawn } = require("child_process");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

function run() {
  return new Promise((resolve, reject) => {
    let outA = "";
    let outB = "";

    const a = spawn("node", [
      "prototype/real-node/p2p_node.js",
      "--id", "node-A",
      "--port", "19001",
      "--duration", "1800"
    ]);

    a.stdout.on("data", d => outA += d.toString());
    a.stderr.on("data", d => outA += d.toString());

    setTimeout(() => {
      const b = spawn("node", [
        "prototype/real-node/p2p_node.js",
        "--id", "node-B",
        "--port", "19002",
        "--peer", "127.0.0.1:19001",
        "--propose",
        "--duration", "1200"
      ]);

      b.stdout.on("data", d => outB += d.toString());
      b.stderr.on("data", d => outB += d.toString());

      let done = 0;
      function finish() {
        done++;
        if (done === 2) resolve({ outA, outB });
      }

      a.on("exit", finish);
      b.on("exit", finish);
      b.on("error", reject);
    }, 300);

    a.on("error", reject);
  });
}

(async () => {
  console.log("=== NODE P2P CHECK ===");

  const { outA, outB } = await run();

  must("node A listens", outA.includes('"event":"LISTENING"'));
  must("node B sends hello", outB.includes('"event":"HELLO_SENT"'));
  must("node A receives hello", outA.includes('"event":"HELLO_RECEIVED"'));
  must("node B sends block", outB.includes('"event":"BLOCK_SENT"'));
  must("node A receives block", outA.includes('"event":"BLOCK_RECEIVED"'));
  must("node A sends attestation", outA.includes('"event":"ATTESTATION_SENT"'));
  must("node B receives attestation", outB.includes('"event":"ATTESTATION_RECEIVED"'));

  console.log("NODE P2P CHECK PASSED");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
