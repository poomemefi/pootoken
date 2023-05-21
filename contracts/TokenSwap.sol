// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenSwap is Ownable, Pausable, ReentrancyGuard {
    // Global Variables
    ERC20 public TOKEN;
    uint256 public RATE = 11520000000;
    uint256 MINDEPOSIT = (1 / 1000) * 1 ether;
    uint256 MAXDEPOSIT = 10 * 1 ether;

    // Events
    event TokenSwapped(
        address indexed User,
        uint256 indexed AmountReceived,
        uint256 indexed AmountSent,
        address ReceivedToken
    );

    // Constructor
    constructor(address _token) {
        require(_token != address(0), "Cannot set zero address");
        TOKEN = ERC20(_token);
    }

    receive() external payable nonReentrant {
        uint256 _amount = msg.value;
        require(_amount >= MINDEPOSIT, "Amount too small");
        require(_amount <= MAXDEPOSIT, "Amount too much");

        uint256 tokenBalance = getTokenBalance();

        require(tokenBalance > 0, "Contract doesn't have suffient funds");

        uint256 rate = _getRates();
        (
            uint256 amountToReceive,
            uint256 EthToRefund
        ) = _calculateAmountReceived(_amount, rate, tokenBalance);

        if (EthToRefund > 0) {
            (bool sent, bytes memory data) = msg.sender.call{
                value: EthToRefund
            }("");
            require(sent, "Failed to send Ether");
        }

        // Transfer TOKEN from contract to user

        TOKEN.transfer(msg.sender, amountToReceive);

        emit TokenSwapped(msg.sender, amountToReceive, _amount, address(TOKEN));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Swap USDT for TOKEN

    function swapETHForToken(
        uint256 _amount
    ) public payable whenNotPaused nonReentrant {
        require(_amount >= MINDEPOSIT, "Amount too small");
        require(_amount <= MAXDEPOSIT, "Amount too much");
        require(msg.value >= _amount, "ETH not equal to amount");

        uint256 tokenBalance = getTokenBalance();

        require(tokenBalance > 0, "Contract doesn't have suffient funds");

        uint256 rate = _getRates();
        (
            uint256 amountToReceive,
            uint256 EthToRefund
        ) = _calculateAmountReceived(_amount, rate, tokenBalance);

        if (EthToRefund > 0) {
            (bool sent, bytes memory data) = msg.sender.call{
                value: EthToRefund
            }("");
            require(sent, "Failed to send Ether");
        }

        // Transfer TOKEN from contract to user

        TOKEN.transfer(msg.sender, amountToReceive);

        emit TokenSwapped(msg.sender, amountToReceive, _amount, address(TOKEN));
    }

    // Withdraw any ERC20 token from contract

    function withdrawERC20(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Cannot withdraw zero address token");
        require(_amount > 0, "Cannot withdraw zero amount");
        require(
            _token != address(TOKEN),
            "Cannot withdraw TOKEN from contract"
        );
        ERC20(_token).transfer(msg.sender, _amount);
    }

    // Get ETH balance of contract

    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Withdraw ETH from contract

    function withdrawETH(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Not enough ETH in contract");
        (bool sent, bytes memory data) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    // Get TOKEN balance of contract

    function getTokenBalance() public view returns (uint256) {
        return TOKEN.balanceOf(address(this));
    }

    // Withdraw TOKEN from contract

    function withdrawTOKEN(uint256 _amount) external onlyOwner {
        require(
            TOKEN.balanceOf(address(this)) >= _amount,
            "Not enough TOKEN in contract"
        );
        TOKEN.transfer(msg.sender, _amount);
    }

    // Get rates

    function _getRates() internal view returns (uint256) {
        return RATE;
    }

    // Set rates

    function setRates(uint256 _rate) external onlyOwner {
        RATE = _rate;
    }

    // Calculate amount of TOKEN to be received

    function _calculateAmountReceived(
        uint256 _amount,
        uint256 _rate,
        uint256 _tokenBalance
    ) internal pure returns (uint256 amountToReceive, uint256 EthToRefund) {
        amountToReceive = _amount * _rate;

        if (amountToReceive > _tokenBalance) {
            unchecked {
                EthToRefund = _amount - (_tokenBalance / _rate);
            }

            amountToReceive = _tokenBalance;

            return (amountToReceive, EthToRefund);
        }

        return (amountToReceive, EthToRefund);
    }
}
