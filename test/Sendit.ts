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
      expiry: number;
    },
    signer: SignerWithAddress
  ) => {
    const request = {
      chainId: (await signer.provider?.getNetwork())?.chainId || 1,
      nonce: requestRaw.nonce,
      recipient: requestRaw.recipient.address,
      value: requestRaw.value,
      token_address: requestRaw.token_address,
      expiry: requestRaw.expiry,
    };
    await token.connect(signer).approve(sendit.address, request.value);

    const signature = await signMetaTxRequest(
      requestRaw.recipient,
      sendit,
      request
    );
    // break this signature into v, r, s
    const { v, r, s } = ethers.utils.splitSignature(signature);
    let value = request.value;
    // call send function
    if (request.token_address !== ethers.constants.AddressZero) {
      value = 0;
    }
    const sendTx = await sendit
      .connect(signer)
      .send(
        request.nonce,
        request.recipient,
        request.value,
        request.token_address,
        request.expiry,
        v,
        r,
        s,
        { value }
      );
    await sendTx.wait();
    return sendTx;
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

  it.skip("Should set proper owner", async function () {
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
      expiry: new Date().getTime() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    await sendToken(request, signers[1]);
    // check if receiver has 10 tokens
    expect(await token.balanceOf(request.recipient.address)).to.equal(
      request.value
    );
  });

  it("Should emit an Request completed event", async function () {
    const request = {
      nonce: 0,
      recipient: signers[0],
      value: 10,
      token_address: token.address,
      expiry: new Date().getTime() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    await expect(sendToken(request, signers[1]))
      .to.emit(sendit, "RequestCompleted")
      .withArgs(
        request.nonce,
        signers[1].address,
        request.recipient.address,
        request.value,
        request.token_address
      );
  });

  it("Should not send 10 tokens from owner to receiver if nonce is wrong", async function () {
    const request = {
      nonce: 0,
      recipient: signers[0],
      value: 10,
      token_address: token.address,
      expiry: new Date().getTime() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    await sendToken(request, signers[1]);
    await expect(sendToken(request, signers[1])).to.be.revertedWith(
      "Sendit: Nonce already used"
    );
  });

  it("Should send native token from sender to receiver", async function () {
    const request = {
      nonce: 0,
      recipient: signers[0],
      value: 10,
      token_address: ethers.constants.AddressZero,
      expiry: new Date().getTime() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    const recipientBalanceBefore = await request.recipient.getBalance();
    await sendToken(request, signers[1]);
    expect(
      (await request.recipient.getBalance()).sub(recipientBalanceBefore)
    ).to.equal(10);
  });

  it("Upgrade via plugin", async () => {
    const sntV2 = await ethers.getContractFactory("SenditV2");
    const snt2 = await upgrades.upgradeProxy(sendit.address, sntV2);

    expect(await snt2.version()).to.eq(2);
    expect(snt2.address).to.eq(sendit.address);
  });

  it("Should change the admin", async () => {
    //change owner to user1
    await upgrades.admin.transferProxyAdminOwnership(signers[1].address);
  });

  it("Upgrade via proxy admin contract ", async () => {
    const sntV2 = await ethers.getContractFactory("SenditV2");

    const newImpl = await upgrades.prepareUpgrade(sendit.address, sntV2, {
      kind: "transparent",
    });

    //method is useful when admin is not available in contract
    const proxyAdmin = await upgrades.admin.getInstance();

    await proxyAdmin.connect(signers[1]).upgrade(sendit.address, newImpl);
    const snt2 = sntV2.attach(sendit.address);

    expect(await snt2.version()).to.eq(2);
  });
});
