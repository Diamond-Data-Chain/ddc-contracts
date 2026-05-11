const hre = require("hardhat");

async function main() {
  console.log("=== RECORDER EXECUTION CHECK ===");

  const [owner, user] = await hre.ethers.getSigners();

  const Recorder = await hre.ethers.getContractFactory("DDCPresaleRecorder");

  const recorder = await Recorder.deploy(
    owner.address,
    owner.address
  );

  await recorder.waitForDeployment();

  const projectId = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("DDC_PROJECT_V1")
  );

  const sourceRef = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("purchase-1")
  );

  await (
    await recorder.recordPurchase(
      projectId,
      user.address,
      hre.ethers.parseEther("1000"),
      hre.ethers.ZeroAddress,
      1000000,
      1,
      hre.ethers.ZeroHash,
      sourceRef,
      0
    )
  ).wait();

  const totals = await recorder.getUserPresaleTotals(
    projectId,
    user.address
  );

  console.log("ddc:", totals[0].toString());
  console.log("usdt:", totals[1].toString());

  const count = await recorder.getUserPurchaseCount(
    projectId,
    user.address
  );

  console.log("user count:", count.toString());

  const rows = await recorder.listUserPurchases(
    projectId,
    user.address,
    0,
    10
  );

  console.log("rows:", rows.length);

  const globalCount = await recorder.getGlobalPurchaseCount(projectId);

  console.log("global count:", globalCount.toString());

  let duplicateBlocked = false;

  try {
    await recorder.recordPurchase(
      projectId,
      user.address,
      hre.ethers.parseEther("1000"),
      hre.ethers.ZeroAddress,
      1000000,
      1,
      hre.ethers.ZeroHash,
      sourceRef,
      0
    );
  } catch {
    duplicateBlocked = true;
  }

  console.log("duplicate blocked:", duplicateBlocked);

  if (!duplicateBlocked) {
    throw new Error("duplicate sourceRef NOT blocked");
  }

  console.log("RECORDER EXECUTION CHECK PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
