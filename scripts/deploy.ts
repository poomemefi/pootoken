import hre, { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("PooMeme");
  const token = await Token.deploy();
  await token.deployed();

  console.log("PooMeme: ", token.address);

  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(token.address);
  await tokenSwap.deployed();

  console.log("TokenSwap: ", tokenSwap.address);

  // Transfer 1600000000000 Tokens to TokenSwap contract
  await token.transfer(
    tokenSwap.address,
    ethers.utils.parseEther(String(1600000000000))
  );

  // Set Token Swap contract address in Token smart contract
  await token.setTokenSwapContract(tokenSwap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
