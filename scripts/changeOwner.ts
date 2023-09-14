import { ethers } from "hardhat";

async function main(): Promise<void> {
    const proxyContractAddress = "<proxy-contract>" ;
    const newOwner = "<new-owner-address>"; 
    //fetch admin contract address from proxy
    const provider = ethers.provider;
    let res = await provider.getStorageAt(
		proxyContractAddress, 
		"0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
		"latest"
	);
    const proxyAdminAddress = "0x" + res.substring(26);
  
    const proxyAdminABI = [
        "function owner() view returns(address)",
        "function transferOwnership(address newOwner) public"
    ]
    const proxyAdmin = new ethers.Contract(proxyAdminAddress, proxyAdminABI ,provider )
    await proxyAdmin.transferOwnership(newOwner);

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
