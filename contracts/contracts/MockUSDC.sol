// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes on Base Sepolia
 * Features 6 decimals to match real USDC
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    event Faucet(address indexed recipient, uint256 amount);

    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        // Mint 1 trillion tokens to deployer (1e12 with 6 decimals = 1e18)
        _mint(msg.sender, 1_000_000_000_000 * 10**DECIMALS);
    }

    /**
     * @dev Returns 6 decimals to match real USDC
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Mint tokens to specified address
     * @param to Recipient address
     * @param amount Amount to mint (in token units, not wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Public faucet for testing - gives 10,000 mUSDC per call
     * Anyone can call this to get test tokens
     */
    function faucet() external {
        uint256 faucetAmount = 10_000 * 10**DECIMALS;
        _mint(msg.sender, faucetAmount);
        emit Faucet(msg.sender, faucetAmount);
    }

    /**
     * @dev Convenience function to get faucet amount for testing
     */
    function faucetAmount() external pure returns (uint256) {
        return 10_000 * 10**DECIMALS;
    }
}
