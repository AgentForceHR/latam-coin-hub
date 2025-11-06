// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Staking
 * @dev Stake Estable tokens for voting power and rewards
 */
contract Staking is Ownable, ReentrancyGuard {
    IERC20 public estableToken;

    uint256 public constant EARLY_UNSTAKE_PENALTY = 10; // 10% penalty
    uint256 public constant MIN_LOCK_MONTHS = 3;
    uint256 public constant MAX_LOCK_MONTHS = 12;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockMonths;
        uint256 vePower;
    }

    mapping(address => Stake[]) public stakes;
    mapping(address => uint256) public totalStaked;
    uint256 public totalVotingPower;

    event Staked(address indexed user, uint256 stakeId, uint256 amount, uint256 lockMonths, uint256 vePower);
    event Unstaked(address indexed user, uint256 stakeId, uint256 amount, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _estableToken) Ownable(msg.sender) {
        estableToken = IERC20(_estableToken);
    }

    /**
     * @dev Stake Estable tokens
     * @param amount Amount to stake
     * @param lockMonths Lock period in months (3-12)
     */
    function stake(uint256 amount, uint256 lockMonths) public nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lockMonths >= MIN_LOCK_MONTHS && lockMonths <= MAX_LOCK_MONTHS, "Invalid lock period");
        require(estableToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Calculate ve-power: base amount + bonus based on lock period
        uint256 vePower = amount + (amount * lockMonths * 8) / 100;

        stakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            lockMonths: lockMonths,
            vePower: vePower
        }));

        totalStaked[msg.sender] += amount;
        totalVotingPower += vePower;

        emit Staked(msg.sender, stakes[msg.sender].length - 1, amount, lockMonths, vePower);
    }

    /**
     * @dev Unstake tokens
     * @param stakeId Index of the stake to unstake
     */
    function unstake(uint256 stakeId) public nonReentrant {
        require(stakeId < stakes[msg.sender].length, "Invalid stake ID");

        Stake memory userStake = stakes[msg.sender][stakeId];
        require(userStake.amount > 0, "Stake already withdrawn");

        uint256 lockEndTime = userStake.startTime + (userStake.lockMonths * 30 days);
        uint256 amountToReturn = userStake.amount;
        uint256 penalty = 0;

        // Apply penalty if unstaking before lock period ends
        if (block.timestamp < lockEndTime) {
            penalty = (amountToReturn * EARLY_UNSTAKE_PENALTY) / 100;
            amountToReturn -= penalty;
        }

        // Remove stake by replacing with last and popping
        stakes[msg.sender][stakeId] = stakes[msg.sender][stakes[msg.sender].length - 1];
        stakes[msg.sender].pop();

        totalStaked[msg.sender] -= userStake.amount;
        totalVotingPower -= userStake.vePower;

        require(estableToken.transfer(msg.sender, amountToReturn), "Transfer failed");

        emit Unstaked(msg.sender, stakeId, amountToReturn, penalty);
    }

    /**
     * @dev Get all stakes for a user
     * @param user User address
     */
    function getStakes(address user) public view returns (Stake[] memory) {
        return stakes[user];
    }

    /**
     * @dev Get total voting power for a user
     * @param user User address
     */
    function getTotalVePower(address user) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < stakes[user].length; i++) {
            total += stakes[user][i].vePower;
        }
        return total;
    }

    /**
     * @dev Calculate rewards for a user
     * @param user User address
     */
    function calculateRewards(address user) public view returns (uint256) {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakes[user].length; i++) {
            Stake memory userStake = stakes[user][i];
            uint256 stakeDuration = block.timestamp - userStake.startTime;

            // APY based on lock period: 5% (3mo), 10% (6mo), 15% (12mo)
            uint256 apy;
            if (userStake.lockMonths >= 12) {
                apy = 15;
            } else if (userStake.lockMonths >= 6) {
                apy = 10;
            } else {
                apy = 5;
            }

            // Calculate rewards: (amount * APY * days staked) / 365 days
            uint256 reward = (userStake.amount * apy * stakeDuration) / (365 days * 100);
            totalRewards += reward;
        }

        return totalRewards;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = estableToken.balanceOf(address(this));
        require(estableToken.transfer(owner(), balance), "Transfer failed");
    }
}
