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
      id: 1,
      recipient: signers[0].address,
      value: 10,
      token_address: token.address,
    };

    await token.connect(signers[1]).approve(sendit.address, 10);

    const signature = await signMetaTxRequest(signers[0], sendit, request);
    // break this signature into v, r, s
    const { v, r, s } = ethers.utils.splitSignature(signature);
    // call send function
    const sendTx = await sendit
      .connect(signers[1])
      .send(
        request.id,
        request.recipient,
        request.value,
        request.token_address,
        v,
        r,
        s
      );
    await sendTx.wait();
    // check if receiver has 10 tokens
    expect(await token.balanceOf(request.recipient)).to.equal(request.value);
  });
});
