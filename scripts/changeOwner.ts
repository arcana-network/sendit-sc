import { ethers, upgrades } from "hardhat";
import { abi } from "../deployments/ganache/DefaultProxyAdmin.json"

async function main(): Promise<void> {
    const proxyContractAddress = "0x1F73976FA75B971Ef547E5FE94676285bC698a2f" ;
    const newOwner = "<new-owner-address>"; 
    //fetch admin contract address from proxy
    const provider = ethers.provider;
    let res = await provider.getStorageAt(
		proxyContractAddress, 
		"0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
		"latest"
	);
    const proxyAdminAddress = "0x" + res.substring(26);
  
  
    const proxyAdmin = new ethers.Contract(proxyAdminAddress, abi ,provider )

    //await proxyAdmin.transferOwnership(newOwner);

    console.log(`
    Proxy Admin: ${proxyAdminAddress} 
    Owner: ${await proxyAdmin.owner()}
    `);

}
main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
