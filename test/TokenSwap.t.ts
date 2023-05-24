import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import dotenv from "dotenv";
import { utils } from "ethers";

dotenv.config();

describe("Token Swap Contract", function () {
  async function deployTokenSwapFixtures() {
    const Token = await ethers.getContractFactory("PooMeme");
    const token = await Token.deploy();
    await token.deployed();

    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    const TokenSwapContract = await TokenSwap.deploy(token.address);
    await TokenSwapContract.deployed();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Transfer 1600000000000 Tokens to TokenSwap contract
    await token.transfer(
      TokenSwapContract.address,
      ethers.utils.parseEther(String(1600000000000))
    );

    // Set Token Swap contract address in Token smart contract
    await token.setTokenSwapContract(TokenSwapContract.address);

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

    return { token, TokenSwapContract, owner, addr1, addr2, addr3 };
  }

  it("Should swap ETH for token", async function () {
    const { TokenSwapContract, token, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenSwapFixtures);

    const ownerBalance = Number(
      ethers.utils.formatEther(await owner.getBalance())
    );
    const rate = 11520000000;

    const options = { value: ethers.utils.parseEther("5") };

    await TokenSwapContract.connect(addr1).swapETHForToken(
      ethers.utils.parseEther("5"),
      options
    );

    // Check ETH balance of owner of TokenSwap contract

    expect(Number(ethers.utils.formatEther(await owner.getBalance()))).to.equal(
      5 + ownerBalance
    );

    // Check if Token balance of TokenSwap contract is 5 * 11520000000
    expect(
      Number(ethers.utils.formatEther(await token.balanceOf(addr1.address)))
    ).to.equal(5 * rate);
  });

  it("Should swap ETH for token using fallback function", async function () {
    const { TokenSwapContract, token, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenSwapFixtures);

    console.log(
      Number(
        ethers.utils.formatEther(await TokenSwapContract.getTokenBalance())
      )
    );
    const tokenBalance = Number(
      ethers.utils.formatEther(await TokenSwapContract.getTokenBalance())
    );
    const amountTokens = 10 * 11520000000;
    let amountTokensReceived = amountTokens;
    let contractEthBalance = 10;

    const ownerBalance = Number(
      ethers.utils.formatEther(await owner.getBalance())
    );

    if (amountTokens > tokenBalance) {
      amountTokensReceived = tokenBalance;
      contractEthBalance = 10 - (10 - tokenBalance / 11520000000);
    }

    const recipientAddress = TokenSwapContract.address;
    const amountToSend = ethers.utils.parseEther("10");

    // const estimatedGasLimit = await addr2.estimateGas({
    //   to: recipientAddress,
    //   value: amountToSend,
    // });

    await addr2.estimateGas({
      to: recipientAddress,
      value: amountToSend,
    });

    // await expect(() =>
    //   addr2.estimateGas({
    //     to: recipientAddress,
    //     value: amountToSend,
    //   })
    // ).to.be.revertedWith("Amount too much");

    // const transaction = {
    //   to: recipientAddress,
    //   value: amountToSend,
    //   gasLimit: estimatedGasLimit,
    // };

    // await expect(() =>
    //   addr2.estimateGas({
    //     to: recipientAddress,
    //     value: amountToSend,
    //   })
    // ).to.be.revertedWith("Amount too much");
    // await expect(() => addr2.sendTransaction(transaction)).to.be.revertedWith(
    //   "Amount too much"
    // );

    // const signedTransaction = await addr2.sendTransaction(transaction);
    // console.log("Transaction sent with hash:", signedTransaction.hash);

    // // Check ETH balance of owner of TokenSwap contract

    // expect(Number(ethers.utils.formatEther(await owner.getBalance()))).to.equal(
    //   10 + ownerBalance
    // );
    // // Check if Token balance of TokenSwap contract is 50 * 11520000000
    // expect(
    //   Number(ethers.utils.formatEther(await token.balanceOf(addr2.address)))
    // ).to.equal(amountTokensReceived);
  });
});
