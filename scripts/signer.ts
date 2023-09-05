const ethSigUtil = require("eth-sig-util");
import { Sendit } from "../typechain-types/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const Request = [
  { name: "id", type: "uint256" },
  { name: "recipient", type: "address" },
  { name: "value", type: "uint256" },
  { name: "token_address", type: "address" },
];

function getMetaTxTypeData(chainId: number, verifyingContract: string) {
  return {
    types: {
      EIP712Domain,
      Request,
    },
    domain: {
      name: "Sendit",
      version: "0.0.1",
      chainId,
      verifyingContract,
    },
    primaryType: "Request",
  };
}

async function signTypedData(
  signer: any,
  from: string,
  data: any
) {
  delete data.types.EIP712Domain;
  return await signer._signTypedData(data.domain, data.types, data.message);
}

async function buildTypedData(sendit: any, request: any) {
  const chainId = await sendit.provider
    .getNetwork()
    .then((n: { chainId: any }) => n.chainId);
  const typeData = getMetaTxTypeData(chainId, sendit.address);
  return { ...typeData, message: request };
}

export async function signMetaTxRequest(
  signer: any,
  sendit: Sendit,
  request: any
) {
  const toSign = await buildTypedData(sendit, request);
  const signature = await signTypedData(
    signer,
    await signer.getAddress(),
    toSign
  );
  return signature;
}
