// write deploy script for Sendit.sol
import { ethers, network, upgrades } from "hardhat";
import { Sendit__factory } from "../typechain-types/factories/contracts/Sendit__factory";
import { SenditOld__factory } from "../typechain-types/factories/contracts/SenditOld.sol/SenditOld__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Manifest,
  hashBytecodeWithoutMetadata,
} from "@openzeppelin/upgrades-core";

async function main(): Promise<void> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  console.log("Deployer:", signers[0].address);
  console.log(
    "Balance:",
    ethers.utils.formatEther(await signers[0].getBalance())
  );
  console.log("Total signers", signers.length);

  // let senditProxyAddress = "0x35F7479402B2FE28CD90B9C07bc2ae9dF8662eE6";
  let senditFactory = (await ethers.getContractFactory(
    "Sendit",
    signers[0]
  )) as Sendit__factory;
  
  let sendit = await senditFactory.deploy();
  await sendit.deployed();
  console.log("New address",sendit.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
