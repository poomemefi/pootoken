# ERC20 Token Smart Contract:  $POO Token

This repository contains the code for an Ethereum-based ERC20 token smart contract called the POO Token. This contract implements the ERC20 standard with additional features for the token itself.

## Token Details

- Chain: Ethereum
- Standard: ERC20
- Name: POO Token
- Symbol: POO
- Total Supply: 8,000,000,000,000


## Key Features

- The contract can conduct the following at any time by the master contract admin address
    - Increase or decrease allowance 
    - Lock or unlock token transfers
    - Paused and unpaused
    - Be updated and redeployed at any time
    - Ownership can be renounced

## Functions

- approve:   A standard ERC20 function, called by a user to allow another wallet spend tokens
- decreaseAllowance:   A standard ERC20 function, called by user to decrease the amount of user tokens another approved wallet is allowed to spend
- increaseAllowance:   A standard ERC20 function, called by user to increase the amount of user tokens another approved wallet is allowed to spend
- lock:   A custom POO Token function that allows the admin to lock token transfers
- pause:   A custom POO Token function that allows the the admin to pause all public functions in the smart contract
- renounceOwnership:   A standard function from the OpenZeppelin Ownable library that allows admin to renounce the ownership of the smart contract without setting another admin 
- setTax:   A custom POO token function that allows the admin to update / upgrade the tax value on every transfer
- setTokenSwapContract:   A custom POO token function that allows the admin to set the presale token swap contract address. This address must be added to the POO token contract to enable the swap contract transfer tokens without tax charge. This function must be called after deploying the POO token contract (admin must pass the presale token swap contract address in side function)
- transfer:   A standard ERC20 function; however, has been modified to add some custom functionalities. This function is called directly by the owner of the tokens.
- transferFrom:   A standard ERC20 function; however, has been modified to add some custom functionalities. This function can be called on behalf of the owner of the token but requires that the sender has approval to send that amount of tokens on behalf of the token owner.
- transferOwnership:   A function from OpenZeppelin Ownable library, to transfer ownership / admin abilities to another wallet address
- unlock:   A custom POO Token function that allows the admin to unlock token transfer
- unpause:   A custom POO Token function that allows the admin to unpause all public functions in the smart contract

More details can be found in the official documentation from the Ethereum foundation here: https://ethereum.org/nl/developers/tutorials/erc20-annotated-code/

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository
```bash
git clone https://github.com/poodotfinance/pootoken.git
```

2. Install dependencies
```
npm install
```

3. Compile the smart contract
```
npx hardhat compile
```

4. Deploy the smart contract
```
npx hardhat run scripts/deploy.js --network <network>
```


## Testing

To run the test suite, execute the following command:
```
npx hardhat test
