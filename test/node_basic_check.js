const { execSync } = require("child_process");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== NODE BASIC CHECK ===");

const out = execSync("node prototype/real-node/node.js", { encoding: "utf8" });

must("node starts", out.includes('"msg":"START"'));
must("block proposed", out.includes('"msg":"BLOCK_PROPOSED"'));
must("finality evaluated", out.includes('"msg":"FINALITY"'));

console.log("NODE BASIC CHECK PASSED");
