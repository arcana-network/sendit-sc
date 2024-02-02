// write deploy script for Sendit.sol
import { ethers, network, upgrades } from "hardhat";
import { Sendit__factory } from "../typechain-types/factories/contracts/Sendit__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Manifest, hashBytecodeWithoutMetadata } from "@openzeppelin/upgrades-core";

async function main(): Promise<void> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  console.log("Deployer:", signers[0].address);
  console.log(
    "Balance:",
    ethers.utils.formatEther(await signers[0].getBalance())
  );
  console.log("Total signers", signers.length);

  const senditFactory = (await ethers.getContractFactory(
    "SenditV2",
    signers[0]
  )) as Sendit__factory;
  const sendit = await upgrades.deployProxy(senditFactory, []);
  await sendit.deployed();
  console.log("Sendit deployed to:", sendit.address);
  
  // Peer into OpenZeppelin manifest to extract the implementation address
  const ozUpgradesManifestClient = await Manifest.forNetwork(network.provider);
  const manifest = await ozUpgradesManifestClient.read();
  const bytecodeHash = hashBytecodeWithoutMetadata(senditFactory.bytecode);
  const implementationContract = manifest.impls[bytecodeHash];
  console.log("Logic contract", implementationContract?.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
