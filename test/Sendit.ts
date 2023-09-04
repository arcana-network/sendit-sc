// write test case for Sendit.sol

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Sendit } from "../typechain-types/contracts/Sendit";
import { Sendit__factory } from "../typechain-types/factories/contracts/Sendit__factory";
import { Token } from "../typechain-types/contracts/Token";
import { Token__factory } from "../typechain-types/factories/contracts/Token__factory";

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
    sendit = await senditFactory.deploy();
    await sendit.deployed();
    let initializeTx = await sendit.initialize();
    await initializeTx.wait();

    const tokenFactory = (await ethers.getContractFactory(
      "Token",
      signers[0]
    )) as Token__factory;
    token = await tokenFactory.deploy();
    await token.deployed();
    initializeTx = await token.initialize();
    await initializeTx.wait();
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
    expect(await token.balanceOf(signers[0].address)).to.equal(10**9);
  });
});
