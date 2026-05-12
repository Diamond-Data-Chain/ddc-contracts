const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("No deployer signer");

  console.log("Deploying DDCPresaleRecorder with:", deployer.address);

  const Recorder = await hre.ethers.getContractFactory("DDCPresaleRecorder");

  const recorder = await Recorder.deploy(
    deployer.address,
    deployer.address
  );

  await recorder.waitForDeployment();

  const addr = await recorder.getAddress();

  console.log("DDCPresaleRecorder:", addr);
  console.log("Owner:", await recorder.owner());
  console.log("Writer:", await recorder.writer());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
