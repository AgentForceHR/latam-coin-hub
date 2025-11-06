// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EstToken
 * @dev Estable governance token with burn capability for deflation simulation
 * 18 decimals, 1 billion initial supply
 */
contract EstToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    event Faucet(address indexed recipient, uint256 amount);

    constructor() ERC20("Estable", "EST") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint additional tokens (owner only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Public faucet for testing - gives 1,000 EST per call
     * Anyone can call this to get test tokens
     */
    function faucet() external {
        uint256 faucetAmount = 1_000 * 10**18;
        _mint(msg.sender, faucetAmount);
        emit Faucet(msg.sender, faucetAmount);
    }

    /**
     * @dev Burn tokens from caller's balance (inherited from ERC20Burnable)
     * Enables deflation simulation for tokenomics testing
     */
    // burn() function inherited from ERC20Burnable

    /**
     * @dev Burn tokens from another account (with allowance)
     * Inherited from ERC20Burnable
     */
    // burnFrom() function inherited from ERC20Burnable
}
