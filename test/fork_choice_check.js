const {
  detectFork,
  chooseCanonical,
} = require("../prototype/real-node/fork_choice");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== FORK CHOICE CHECK ===");

const blocks = [
  {
    height: 1,
    blockHash: "block-A",
    confirmations: 2,
    finalized: true,
  },
  {
    height: 1,
    blockHash: "block-B",
    confirmations: 1,
    finalized: false,
  },
];

const forks = detectFork(blocks);

must("fork detected at same height", forks.length === 1);
must("fork fault type correct", forks[0].fault === "FORK_DETECTED");

const canonical = chooseCanonical(blocks);

must("finalized block chosen canonical", canonical.blockHash === "block-A");

const nonFinalBlocks = [
  {
    height: 2,
    blockHash: "block-C",
    confirmations: 1,
    finalized: false,
  },
  {
    height: 2,
    blockHash: "block-D",
    confirmations: 3,
    finalized: false,
  },
];

const canonical2 = chooseCanonical(nonFinalBlocks);

must("most confirmed block chosen when no finality", canonical2.blockHash === "block-D");

const tieBlocks = [
  {
    height: 3,
    blockHash: "aaa",
    confirmations: 2,
    finalized: false,
  },
  {
    height: 3,
    blockHash: "bbb",
    confirmations: 2,
    finalized: false,
  },
];

const canonical3 = chooseCanonical(tieBlocks);

must("tie resolved deterministically", canonical3.blockHash === "aaa");

console.log("FORK CHOICE CHECK PASSED");
