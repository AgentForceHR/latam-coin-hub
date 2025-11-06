// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EstableToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    constructor() ERC20("Estable Token", "EST") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10**18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function faucet() external {
        require(totalSupply() + 100 * 10**18 <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, 100 * 10**18);
    }
}
