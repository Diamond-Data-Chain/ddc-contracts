const { execSync } = require("child_process");

function run(name) {
  return execSync(`node prototype/data-layer/data_validator.js ${name}`, { encoding: "utf8" });
}

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== DATA LAYER VALIDATION CHECK ===");

must("valid object accepted", run("valid").includes('"status": "accepted"'));
must("replay rejected", run("replay").includes("replay detected"));
must("conflict rejected", run("conflict").includes("conflicting dataset update"));
must("invalid plausible rejected", run("invalid_plausible").includes("real-world fact requires verificationRefs"));

console.log("DATA LAYER VALIDATION CHECK PASSED");
