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

    console.log("PooMeme: ", token.address);

    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    const TokenSwapContract = await TokenSwap.deploy(token.address);
    await TokenSwapContract.deployed();

    console.log("TokenSwap: ", TokenSwapContract.address);

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Transfer 1600000000000 Tokens to TokenSwap contract
    await token.transfer(
      TokenSwapContract.address,
      ethers.utils.parseEther(String(1600000000000))
    );

    console.log(
      ethers.utils.formatEther(await TokenSwapContract.getTokenBalance())
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

    console.log(
      ethers.utils.formatEther(await TokenSwapContract.getTokenBalance())
    );

    const options = { value: ethers.utils.parseEther("5") };

    await TokenSwapContract.connect(addr1).swapETHForToken(
      ethers.utils.parseEther("5"),
      options
    );

    console.log(await TokenSwapContract.getETHBalance());

    // Check if ETH balance of TokenSwap contract is 50
    expect(
      Number(ethers.utils.formatEther(await TokenSwapContract.getETHBalance()))
    ).to.equal(5);
    // Check if Token balance of TokenSwap contract is 50 * 11520000000
    // 2% tax on each transfer
    console.log(
      Number(ethers.utils.formatEther(await token.balanceOf(addr1.address)))
    );
    expect(
      Number(ethers.utils.formatEther(await token.balanceOf(addr1.address)))
    ).to.equal(5 * 11520000000);
    console.log(5 * 11520000000);
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

    if (amountTokens > tokenBalance) {
      amountTokensReceived = tokenBalance;
      contractEthBalance = 10 - (10 - tokenBalance / 11520000000);
    }

    const recipientAddress = TokenSwapContract.address;
    const amountToSend = ethers.utils.parseEther("10");

    const estimatedGasLimit = await addr2.estimateGas({
      to: recipientAddress,
      value: amountToSend,
    });

    const transaction = {
      to: recipientAddress,
      value: amountToSend,
      gasLimit: estimatedGasLimit,
    };

    const signedTransaction = await addr2.sendTransaction(transaction);
    console.log("Transaction sent with hash:", signedTransaction.hash);

    console.log(
      Number(ethers.utils.formatEther(await TokenSwapContract.getETHBalance()))
    );
    console.log(
      Number(
        ethers.utils.formatEther(await TokenSwapContract.getTokenBalance())
      )
    );

    // Check if ETH balance of TokenSwap contract is 50
    expect(
      Number(ethers.utils.formatEther(await TokenSwapContract.getETHBalance()))
    ).to.equal(contractEthBalance);
    // Check if Token balance of TokenSwap contract is 50 * 11520000000
    // 2% tax on each transfer
    expect(
      Number(ethers.utils.formatEther(await token.balanceOf(addr2.address)))
    ).to.equal(amountTokensReceived);
  });

  it("Should withdraw ETH from contract", async function () {
    const { TokenSwapContract, token, owner, addr1, addr2, addr3 } =
      await loadFixture(deployTokenSwapFixtures);

    const options = { value: ethers.utils.parseEther("5") };

    await TokenSwapContract.connect(addr1).swapETHForToken(
      ethers.utils.parseEther("5"),
      options
    );

    // get contract ETH balance
    const balance = await TokenSwapContract.getETHBalance();

    await TokenSwapContract.withdrawETH(balance);

    expect(
      Number(ethers.utils.formatEther(await TokenSwapContract.getETHBalance()))
    ).to.equal(0);
  });
});
