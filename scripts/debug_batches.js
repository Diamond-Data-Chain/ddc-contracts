const hre = require("hardhat");

async function main() {
  const presaleAddr = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
  const presale = await hre.ethers.getContractAt("DDCPresaleVesting", presaleAddr);

  console.log("presale:", presaleAddr);
  console.log("currentBatch:", (await presale.currentBatch()).toString());
  console.log("finalized:", await presale.finalized());

  for (let i = 1; i <= 5; i++) {
    const b = await presale.batchInfo(i);
    console.log("batch", i, {
      price: b[0].toString(),
      baseAllocation: b[1].toString(),
      rolloverIn: b[2].toString(),
      hardCap: b[3].toString(),
      sold: b[4].toString(),
      startTime: b[5].toString(),
      endTime: b[6].toString(),
      isActive: b[7],
      isClosed: b[8],
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
