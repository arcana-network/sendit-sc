import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Sendit } from "../typechain-types/contracts/Sendit";
import { Sendit__factory } from "../typechain-types/factories/contracts/Sendit__factory";
import { Token } from "../typechain-types/contracts/Token";
import { Token__factory } from "../typechain-types/factories/contracts/Token__factory";
import { signMetaTxRequest } from "../scripts/signer";

describe("Sendit", function () {
  let sendit: Sendit;
  let token: Token;
  let signers: SignerWithAddress[];

  const sendToken = async (
    requestRaw: {
      nonce: number;
      recipient: SignerWithAddress;
      value: number;
      token_address: string;
    },
    signer: SignerWithAddress
  ) => {
    const request = {
      nonce: requestRaw.nonce,
      recipient: requestRaw.recipient.address,
      value: requestRaw.value,
      token_address: requestRaw.token_address,
    };

    await token.connect(signer).approve(sendit.address, request.value);

    const signature = await signMetaTxRequest(
      requestRaw.recipient,
      sendit,
      request
    );
    // break this signature into v, r, s
    const { v, r, s } = ethers.utils.splitSignature(signature);
    // call send function
    const sendTx = await sendit
      .connect(signer)
      .send(
        request.nonce,
        request.recipient,
        request.value,
        request.token_address,
        v,
        r,
        s
      );
    await sendTx.wait();
  };

  beforeEach(async function () {
    signers = await ethers.getSigners();
    const senditFactory = (await ethers.getContractFactory(
      "Sendit",
      signers[0]
    )) as Sendit__factory;
    sendit = (await upgrades.deployProxy(senditFactory, [])) as Sendit;
    await sendit.deployed();

    const tokenFactory = (await ethers.getContractFactory(
      "Token",
      signers[1]
    )) as Token__factory;
    token = (await upgrades.deployProxy(tokenFactory, [])) as Token;
    await token.deployed();
  });
  it("Cannot call initialize function twice", async function () {
    await expect(sendit.initialize()).to.be.revertedWith(
      "Initializable: contract is already initialized"
    );
  });

  it("Should set proper owner", async function () {
    expect(await sendit.owner()).to.equal(signers[0].address);
  });

  it("Token should have 10**9 tokens", async function () {
    expect(await token.balanceOf(signers[1].address)).to.equal(10 ** 9);
  });

  it("Should send 10 tokens from owner to receiver", async function () {
    // receiver should generate EIP 712 domaing signature for requesting 10 tokens
    const request = {
      nonce: 0,
      recipient: signers[0],
      value: 10,
      token_address: token.address,
    };
    await sendToken(request, signers[1]);
    // check if receiver has 10 tokens
    expect(await token.balanceOf(request.recipient.address)).to.equal(
      request.value
    );
  });

  it("Should not send 10 tokens from owner to receiver if nonce is wrong", async function () {
    const request = {
      nonce: 0,
      recipient: signers[0],
      value: 10,
      token_address: token.address,
    };
    await sendToken(request, signers[1]);
    await expect(sendToken(request, signers[1])).to.be.revertedWith(
      "Sendit: Nonce already used"
    );
  });
});
