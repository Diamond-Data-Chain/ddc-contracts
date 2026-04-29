function detectFork(blocks) {
  const byHeight = new Map();
  const forks = [];

  for (const block of blocks) {
    const key = block.height;

    if (!byHeight.has(key)) {
      byHeight.set(key, []);
    }

    byHeight.get(key).push(block);
  }

  for (const [height, sameHeight] of byHeight.entries()) {
    const uniqueHashes = new Set(sameHeight.map(b => b.blockHash));

    if (uniqueHashes.size > 1) {
      forks.push({
        height,
        blocks: sameHeight,
        fault: "FORK_DETECTED",
      });
    }
  }

  return forks;
}

function scoreBlock(block) {
  return {
    blockHash: block.blockHash,
    height: block.height,
    confirmations: block.confirmations || 0,
    finalized: !!block.finalized,
    score:
      (block.finalized ? 1_000_000 : 0) +
      (block.confirmations || 0) +
      block.height,
  };
}

function chooseCanonical(blocks) {
  if (!blocks.length) return null;

  return [...blocks]
    .map(scoreBlock)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.blockHash.localeCompare(b.blockHash);
    })[0];
}

module.exports = {
  detectFork,
  chooseCanonical,
};
