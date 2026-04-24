require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const solidity = "0.8.20";

const BSC_TESTNET_RPC_URL =
  process.env.BSC_TESTNET_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "";

const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY || process.env.BOT_PRIVATE_KEY || "";

const networks = {
  hardhat: {},
  localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
};

// add only if url exists (prevents HH8)
if (BSC_TESTNET_RPC_URL) {
  networks.bscTestnet = {
    url: BSC_TESTNET_RPC_URL,
    chainId: 97,
    accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
  };
}

module.exports = { solidity, networks };
