// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EstStake
 * @dev Staking contract for EST tokens with time-locked periods and rewards
 * Supports 30, 90, and 180 day lock periods with different boost multipliers
 */
contract EstStake is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // EST token
    IERC20 public immutable estToken;

    // Lock periods in seconds
    uint256 public constant LOCK_30_DAYS = 30 days;
    uint256 public constant LOCK_90_DAYS = 90 days;
    uint256 public constant LOCK_180_DAYS = 180 days;

    // Boost multipliers (in basis points, 100 = 1x)
    uint256 public constant BOOST_30_DAYS = 120; // 1.2x
    uint256 public constant BOOST_90_DAYS = 150; // 1.5x
    uint256 public constant BOOST_180_DAYS = 200; // 2.0x

    // Reward rate (tokens per second per staked token)
    uint256 public rewardRate = 1e12; // Adjustable by owner
    uint256 public constant REWARD_PRECISION = 1e18;

    // Stake info
    struct StakeInfo {
        uint256 amount;
        uint256 lockPeriod;
        uint256 startTime;
        uint256 endTime;
        uint256 boost;
        uint256 rewardDebt;
        bool active;
    }

    // User stakes (user => stake ID => stake info)
    mapping(address => mapping(uint256 => StakeInfo)) public stakes;
    mapping(address => uint256) public stakeCount;

    // Global state
    uint256 public totalStaked;
    uint256 public totalBoostedStaked;
    uint256 public lastRewardTime;
    uint256 public accRewardPerShare;

    // Events
    event Staked(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount,
        uint256 lockPeriod,
        uint256 boost
    );
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event EmergencyUnstake(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 penalty);

    constructor(address _estToken) Ownable(msg.sender) {
        require(_estToken != address(0), "Invalid EST token");
        estToken = IERC20(_estToken);
        lastRewardTime = block.timestamp;
    }

    /**
     * @dev Stake EST tokens with specified lock period
     * @param amount Amount of EST to stake
     * @param lockPeriod Lock period (30, 90, or 180 days)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            lockPeriod == LOCK_30_DAYS ||
            lockPeriod == LOCK_90_DAYS ||
            lockPeriod == LOCK_180_DAYS,
            "Invalid lock period"
        );

        // Update rewards
        _updateRewards();

        // Determine boost multiplier
        uint256 boost;
        if (lockPeriod == LOCK_30_DAYS) {
            boost = BOOST_30_DAYS;
        } else if (lockPeriod == LOCK_90_DAYS) {
            boost = BOOST_90_DAYS;
        } else {
            boost = BOOST_180_DAYS;
        }

        // Transfer EST from user
        estToken.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate boosted amount
        uint256 boostedAmount = (amount * boost) / 100;

        // Create stake
        uint256 stakeId = stakeCount[msg.sender];
        stakes[msg.sender][stakeId] = StakeInfo({
            amount: amount,
            lockPeriod: lockPeriod,
            startTime: block.timestamp,
            endTime: block.timestamp + lockPeriod,
            boost: boost,
            rewardDebt: (boostedAmount * accRewardPerShare) / REWARD_PRECISION,
            active: true
        });

        stakeCount[msg.sender]++;

        // Update totals
        totalStaked += amount;
        totalBoostedStaked += boostedAmount;

        emit Staked(msg.sender, stakeId, amount, lockPeriod, boost);
    }

    /**
     * @dev Unstake EST tokens after lock period
     * @param stakeId ID of the stake to unstake
     */
    function unstake(uint256 stakeId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake not active");
        require(block.timestamp >= stakeInfo.endTime, "Lock period not ended");

        // Update rewards
        _updateRewards();

        uint256 amount = stakeInfo.amount;
        uint256 boostedAmount = (amount * stakeInfo.boost) / 100;

        // Calculate and claim pending rewards
        uint256 pending = _calculatePendingRewards(msg.sender, stakeId);
        if (pending > 0) {
            estToken.safeTransfer(msg.sender, pending);
            emit RewardsClaimed(msg.sender, pending);
        }

        // Mark stake as inactive
        stakeInfo.active = false;

        // Update totals
        totalStaked -= amount;
        totalBoostedStaked -= boostedAmount;

        // Transfer staked EST back to user
        estToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, stakeId, amount);
    }

    /**
     * @dev Emergency unstake with penalty before lock period ends
     * @param stakeId ID of the stake to emergency unstake
     * Penalty: 20% of staked amount is burned
     */
    function emergencyUnstake(uint256 stakeId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake not active");
        require(block.timestamp < stakeInfo.endTime, "Use regular unstake");

        uint256 amount = stakeInfo.amount;
        uint256 boostedAmount = (amount * stakeInfo.boost) / 100;

        // Calculate penalty (20%)
        uint256 penalty = (amount * 20) / 100;
        uint256 amountAfterPenalty = amount - penalty;

        // Mark stake as inactive
        stakeInfo.active = false;

        // Update totals
        totalStaked -= amount;
        totalBoostedStaked -= boostedAmount;

        // Transfer reduced amount to user
        estToken.safeTransfer(msg.sender, amountAfterPenalty);

        // Penalty stays in contract as additional rewards

        emit EmergencyUnstake(msg.sender, stakeId, amountAfterPenalty, penalty);
    }

    /**
     * @dev Claim accumulated rewards for a stake
     * @param stakeId ID of the stake to claim rewards for
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake not active");

        // Update rewards
        _updateRewards();

        // Calculate pending rewards
        uint256 pending = _calculatePendingRewards(msg.sender, stakeId);
        require(pending > 0, "No rewards to claim");

        // Update reward debt
        uint256 boostedAmount = (stakeInfo.amount * stakeInfo.boost) / 100;
        stakeInfo.rewardDebt = (boostedAmount * accRewardPerShare) / REWARD_PRECISION;

        // Transfer rewards
        estToken.safeTransfer(msg.sender, pending);

        emit RewardsClaimed(msg.sender, pending);
    }

    /**
     * @dev Get pending rewards for a user's stake
     * @param user User address
     * @param stakeId Stake ID
     * @return Pending reward amount
     */
    function pendingRewards(address user, uint256 stakeId) external view returns (uint256) {
        return _calculatePendingRewards(user, stakeId);
    }

    /**
     * @dev Get all active stakes for a user
     * @param user User address
     * @return Array of stake IDs
     */
    function getUserStakes(address user) external view returns (uint256[] memory) {
        uint256 count = stakeCount[user];
        uint256 activeCount = 0;

        // Count active stakes
        for (uint256 i = 0; i < count; i++) {
            if (stakes[user][i].active) {
                activeCount++;
            }
        }

        // Build array of active stake IDs
        uint256[] memory activeStakes = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            if (stakes[user][i].active) {
                activeStakes[index] = i;
                index++;
            }
        }

        return activeStakes;
    }

    /**
     * @dev Get stake details
     * @param user User address
     * @param stakeId Stake ID
     */
    function getStakeInfo(address user, uint256 stakeId)
        external
        view
        returns (
            uint256 amount,
            uint256 lockPeriod,
            uint256 startTime,
            uint256 endTime,
            uint256 boost,
            bool active,
            uint256 pending
        )
    {
        StakeInfo memory stakeInfo = stakes[user][stakeId];
        return (
            stakeInfo.amount,
            stakeInfo.lockPeriod,
            stakeInfo.startTime,
            stakeInfo.endTime,
            stakeInfo.boost,
            stakeInfo.active,
            _calculatePendingRewards(user, stakeId)
        );
    }

    /**
     * @dev Update reward rate (owner only)
     * @param newRate New reward rate
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        _updateRewards();
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Private function to update global reward state
     */
    function _updateRewards() private {
        if (block.timestamp <= lastRewardTime) {
            return;
        }

        if (totalBoostedStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastRewardTime;
        uint256 reward = timeElapsed * rewardRate * totalBoostedStaked;

        accRewardPerShare += (reward / totalBoostedStaked);
        lastRewardTime = block.timestamp;
    }

    /**
     * @dev Calculate pending rewards for a stake
     */
    function _calculatePendingRewards(address user, uint256 stakeId)
        private
        view
        returns (uint256)
    {
        StakeInfo memory stakeInfo = stakes[user][stakeId];

        if (!stakeInfo.active || totalBoostedStaked == 0) {
            return 0;
        }

        uint256 boostedAmount = (stakeInfo.amount * stakeInfo.boost) / 100;

        // Calculate pending rewards since last update
        uint256 timeElapsed = block.timestamp - lastRewardTime;
        uint256 pendingReward = timeElapsed * rewardRate * totalBoostedStaked;
        uint256 adjustedAccRewardPerShare = accRewardPerShare + (pendingReward / totalBoostedStaked);

        uint256 accumulated = (boostedAmount * adjustedAccRewardPerShare) / REWARD_PRECISION;

        return accumulated > stakeInfo.rewardDebt ? accumulated - stakeInfo.rewardDebt : 0;
    }
}
