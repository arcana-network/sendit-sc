import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    ganache: {
      url: "http://localhost:8545",
      accounts: [
        "23a48125f38ee2028641a47bd695a43d41cecada7e6d39c9af5174cab3e3a464",
      ],
      saveDeployments: true,
    },
    mumbai: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: [process.env.PRIVATE_KEY as string],
      saveDeployments: true,
    },
    puppy: {
      url: "https://puppynet.shibrpc.com",
      accounts: [process.env.PRIVATE_KEY as string],
      saveDeployments: true,
    },
    bnbTestnet: {
      //fetch url from .env file
      saveDeployments: true,
      url: process.env.BNB_TESTNET_RPC_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    bnb: {
      //fetch url from .env file
      saveDeployments: true,
      url: process.env.BNB_RPC_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    shardeum: {
      url: "https://dapps.shardeum.org",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    skale: {
      url: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },
};

export default config;
