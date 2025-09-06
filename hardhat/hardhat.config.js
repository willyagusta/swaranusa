require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '../.env.local' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.ADMIN_WALLET_PRIVATE_KEY ? [process.env.ADMIN_WALLET_PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
