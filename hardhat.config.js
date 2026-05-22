require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

try {
  require("@nomicfoundation/hardhat-ethers");
} catch (_) {
  try {
    require("@nomiclabs/hardhat-ethers");
  } catch (_) {}
}

module.exports = {
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=97",
          browserURL: "https://testnet.bscscan.com"
        }
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=56",
          browserURL: "https://bscscan.com"
        }
      }
    ]
  },

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
