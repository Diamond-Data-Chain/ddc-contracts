require("dotenv").config();

try {
  require("@nomicfoundation/hardhat-ethers");
} catch (_) {
  try {
    require("@nomiclabs/hardhat-ethers");
  } catch (_) {}
}

module.exports = {
  solidity: "0.8.20",

  networks: {
    hardhat: {},

    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
