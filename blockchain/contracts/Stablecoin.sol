// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Stablecoin
 * @dev Collateralized stablecoin (USD, BRL, ARS)
 */
contract Stablecoin is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant COLLATERAL_RATIO = 150; // 150% minimum
    uint256 public pegRate; // Rate in basis points (e.g., 100 for 1:1, 550 for 5.5:1)

    mapping(address => uint256) public collateralBalances;

    event Minted(address indexed user, uint256 amount, uint256 collateral);
    event Redeemed(address indexed user, uint256 amount, uint256 collateralReturned);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _pegRate
    ) ERC20(name, symbol) Ownable(msg.sender) {
        pegRate = _pegRate;
    }

    /**
     * @dev Mint stablecoins by providing BNB collateral
     * @param amount Amount of stablecoins to mint
     */
    function mint(uint256 amount) public payable nonReentrant {
        uint256 requiredCollateral = (amount * pegRate * COLLATERAL_RATIO) / 10000;
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        collateralBalances[msg.sender] += msg.value;
        _mint(msg.sender, amount);

        // Refund excess collateral
        if (msg.value > requiredCollateral) {
            payable(msg.sender).transfer(msg.value - requiredCollateral);
        }

        emit Minted(msg.sender, amount, requiredCollateral);
    }

    /**
     * @dev Redeem stablecoins for BNB collateral
     * @param amount Amount of stablecoins to redeem
     */
    function redeem(uint256 amount) public nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 collateralToReturn = (amount * pegRate * COLLATERAL_RATIO) / 10000;
        require(collateralBalances[msg.sender] >= collateralToReturn, "Insufficient collateral");
        require(address(this).balance >= collateralToReturn, "Contract insufficient funds");

        collateralBalances[msg.sender] -= collateralToReturn;
        _burn(msg.sender, amount);

        payable(msg.sender).transfer(collateralToReturn);

        emit Redeemed(msg.sender, amount, collateralToReturn);
    }

    /**
     * @dev Get user's collateral balance
     * @param user User address
     */
    function getCollateralBalance(address user) public view returns (uint256) {
        return collateralBalances[user];
    }

    /**
     * @dev Update peg rate (only owner)
     * @param newRate New peg rate in basis points
     */
    function updatePegRate(uint256 newRate) public onlyOwner {
        pegRate = newRate;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
