// write deploy script for Sendit.sol
import { ethers, network, upgrades } from "hardhat";
import { Sendit__factory } from "../typechain-types/factories/contracts/Sendit__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const VERSION = 2;
const SENDIT_ADDRESS = "0x3551f1F9FdF54Fc88eBEd0EbC2EE3a24D2485984";

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
    `SenditV${VERSION}`,
    signers[0]
  )) as Sendit__factory;

  let sendit = await senditFactory.deploy();
  await sendit.deployed();
  console.log("New address", sendit.address);

  await upgrades.upgradeProxy(SENDIT_ADDRESS, senditFactory);
  console.log("Sendit upgraded");
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
