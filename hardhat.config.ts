import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
require('hardhat-deploy');

dotenvConfig({ path: resolve(__dirname, "./.env") });

const config: HardhatUserConfig = {
  solidity: "0.8.8",
  namedAccounts: {
		deployer: 0,
	},
  networks: {
    ganache: {
      url: "http://localhost:8545",
      accounts: ["9e5135396a754a2d0e64b00ffdba8b374c3918186d3f6016facc9d4d1ebbaab1"],
      saveDeployments: true,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY as string],
      saveDeployments: true,
    },
    puppy: {
      url: "https://puppynet.shibrpc.com",
      accounts: [process.env.PRIVATE_KEY as string],
      saveDeployments: true,
    },
    bnb: {
      //fetch url from .env file
      saveDeployments: true,
      url: process.env.BNB_RPC_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
