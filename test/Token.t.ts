import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PooMeme Token Contract", function () {
  async function deployTokenFixtures() {
    const PooMemeToken = await ethers.getContractFactory("PooMeme");
    const PooMemeTokenContract = await PooMemeToken.deploy();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    console.log(
      "owner: ",
      owner.address,
      "addr1: ",
      addr1.address,
      "addr2: ",
      addr2.address,
      "addr3: ",
      addr3.address
    );

    // Transfer 1000 tokens to all addresses
    await PooMemeTokenContract.transfer(addr1.address, 1000);
    // await PooMemeTokenContract.transfer(addr2.address, 1000);
    // await PooMemeTokenContract.transfer(addr3.address, 1000);

    await PooMemeTokenContract.deployed();

    return { PooMemeTokenContract, owner, addr1, addr2, addr3 };
  }

  it("Should not transfer token if locked and sender is not owner or TokenSwap contract ", async function () {
    const { PooMemeTokenContract, addr1, addr2 } = await loadFixture(
      deployTokenFixtures
    );

    if (await PooMemeTokenContract.locked()) {
      console.log(await PooMemeTokenContract.locked());

      await expect(
        PooMemeTokenContract.connect(addr1).transfer(addr2.address, 200)
      ).to.be.revertedWith("Token transfer is Locked");

      console.log(await PooMemeTokenContract.balanceOf(addr2.address));
      console.log(await PooMemeTokenContract.balanceOf(addr1.address));

      expect(await PooMemeTokenContract.balanceOf(addr2.address)).to.equal(0);
    }
  });

  it("Should transfer token if locked and sender is owner or TokenSwap contract ", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    if (await PooMemeTokenContract.locked()) {
      console.log(await PooMemeTokenContract.locked());

      await PooMemeTokenContract.connect(owner).transfer(addr3.address, 200);

      expect(await PooMemeTokenContract.balanceOf(addr3.address)).to.equal(200);
    }

    await PooMemeTokenContract.unlock();

    console.log(await PooMemeTokenContract.locked());

    await PooMemeTokenContract.connect(addr1).transfer(addr2.address, 200);

    expect(await PooMemeTokenContract.balanceOf(addr2.address)).to.equal(200);
  });

  // It should check if owner is owner.address
  it("Should check if owner is owner.address", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    expect(await PooMemeTokenContract.owner()).to.equal(owner.address);
  });

  // It should lock token transfer
  it("Should lock token transfer", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await PooMemeTokenContract.connect(owner).lock();

    expect(await PooMemeTokenContract.locked()).to.equal(true);
  });

  it("Should unlock token transfer", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await PooMemeTokenContract.connect(owner).unlock();

    expect(await PooMemeTokenContract.locked()).to.equal(false);
  });

  // It should set the TokenSwap contract address
  it("Should set the TokenSwap contract address", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await PooMemeTokenContract.connect(owner).setTokenSwapContract(
      addr1.address
    );

    expect(await PooMemeTokenContract.TokenSwapContract()).to.equal(
      addr1.address
    );
  });

  // It should not set TokenSwap contract address if not owner, should revert
  it("should not set TokenSwap contract address if not owner, should revert", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await expect(
      PooMemeTokenContract.connect(addr1).setTokenSwapContract(addr2.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  // It should pause the contract
  it("Should pause the contract", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await PooMemeTokenContract.connect(owner).pause();

    expect(await PooMemeTokenContract.paused()).to.equal(true);
  });

  // It should unpause the contract
  it("Should unpause the contract", async function () {
    const { PooMemeTokenContract, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenFixtures);

    await PooMemeTokenContract.connect(owner).pause();
    if (await PooMemeTokenContract.paused())
      await PooMemeTokenContract.connect(owner).unpause();

    expect(await PooMemeTokenContract.paused()).to.equal(false);
  });

  // It should remove 2% tax on transfer
  it("Should remove 2% tax on transfer", async function () {})
    

});
