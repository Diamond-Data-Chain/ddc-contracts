// Adds BSC Testnet network WITHOUT changing existing hardhat.config.js
// Run with: npx hardhat ... --config hardhat.config.bscTestnet.js

require("dotenv").config();

const base = require("./hardhat.config.js");

const rpc =
  process.env.BSC_TESTNET_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://data-seed-prebsc-1-s1.bnbchain.org:8545";

const pk =
  process.env.DEPLOYER_PRIVATE_KEY ||
  process.env.PRIVATE_KEY ||
  "";

module.exports = {
  ...base,
  networks: {
    ...(base.networks || {}),
    bscTestnet: {
      url: rpc,
      chainId: 97,
      accounts: pk ? [pk] : [],
      gasPrice: 120000000
    }
  }
};
