const hre = require("hardhat");

async function verify(address, args) {
  try {
    console.log("Verifying:", address);

    await hre.run("verify:verify", {
      address,
      constructorArguments: args,
    });

    console.log("OK:", address);
  } catch (e) {
    console.log("VERIFY ERROR:", address);
    console.log(String(e.message || e));
  }
}

async function main() {
  console.log("=== VERIFY ALL CONTRACTS ===");

  console.log("Use explicit constructor args per deployment.");

  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
