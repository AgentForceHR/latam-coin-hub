// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EstableVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable depositToken;
    IERC20 public immutable estToken;

    uint256 public constant BASE_APY = 1000;
    uint256 public constant MAX_BOOST = 500;
    uint256 public constant APY_DENOMINATOR = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    struct UserDeposit {
        uint256 amount;
        uint256 lastUpdateTime;
        uint256 accruedYield;
        uint256 estStaked;
    }

    mapping(address => UserDeposit) public deposits;
    uint256 public totalDeposits;
    uint256 public totalYieldPaid;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 yield);
    event YieldClaimed(address indexed user, uint256 yield);
    event EstStaked(address indexed user, uint256 amount);
    event EstUnstaked(address indexed user, uint256 amount);

    constructor(address _depositToken, address _estToken) Ownable(msg.sender) {
        depositToken = IERC20(_depositToken);
        estToken = IERC20(_estToken);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        _updateYield(msg.sender);

        depositToken.safeTransferFrom(msg.sender, address(this), amount);

        deposits[msg.sender].amount += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        UserDeposit storage userDeposit = deposits[msg.sender];
        require(amount > 0 && amount <= userDeposit.amount, "Invalid amount");

        _updateYield(msg.sender);

        uint256 yield = userDeposit.accruedYield;
        userDeposit.amount -= amount;
        userDeposit.accruedYield = 0;
        totalDeposits -= amount;

        uint256 totalToSend = amount + yield;
        totalYieldPaid += yield;

        depositToken.safeTransfer(msg.sender, totalToSend);

        emit Withdrawn(msg.sender, amount, yield);
    }

    function claimYield() external nonReentrant {
        _updateYield(msg.sender);

        UserDeposit storage userDeposit = deposits[msg.sender];
        uint256 yield = userDeposit.accruedYield;
        require(yield > 0, "No yield to claim");

        userDeposit.accruedYield = 0;
        totalYieldPaid += yield;

        depositToken.safeTransfer(msg.sender, yield);

        emit YieldClaimed(msg.sender, yield);
    }

    function stakeEst(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(deposits[msg.sender].amount > 0, "Must have deposits");

        _updateYield(msg.sender);

        estToken.safeTransferFrom(msg.sender, address(this), amount);
        deposits[msg.sender].estStaked += amount;

        emit EstStaked(msg.sender, amount);
    }

    function unstakeEst(uint256 amount) external nonReentrant {
        UserDeposit storage userDeposit = deposits[msg.sender];
        require(amount > 0 && amount <= userDeposit.estStaked, "Invalid amount");

        _updateYield(msg.sender);

        userDeposit.estStaked -= amount;
        estToken.safeTransfer(msg.sender, amount);

        emit EstUnstaked(msg.sender, amount);
    }

    function _updateYield(address user) internal {
        UserDeposit storage userDeposit = deposits[user];

        if (userDeposit.amount == 0) {
            userDeposit.lastUpdateTime = block.timestamp;
            return;
        }

        if (userDeposit.lastUpdateTime == 0) {
            userDeposit.lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - userDeposit.lastUpdateTime;
        uint256 apy = _calculateAPY(user);

        uint256 yield = (userDeposit.amount * apy * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);

        userDeposit.accruedYield += yield;
        userDeposit.lastUpdateTime = block.timestamp;
    }

    function _calculateAPY(address user) internal view returns (uint256) {
        UserDeposit storage userDeposit = deposits[user];

        if (userDeposit.amount == 0) return BASE_APY;

        uint256 estStaked = userDeposit.estStaked;
        uint256 depositAmount = userDeposit.amount;

        uint256 boostPercentage = (estStaked * 100) / depositAmount;

        if (boostPercentage > 50) boostPercentage = 50;

        uint256 boost = (MAX_BOOST * boostPercentage) / 50;

        return BASE_APY + boost;
    }

    function getPendingYield(address user) external view returns (uint256) {
        UserDeposit storage userDeposit = deposits[user];

        if (userDeposit.amount == 0) return userDeposit.accruedYield;

        uint256 timeElapsed = block.timestamp - userDeposit.lastUpdateTime;
        uint256 apy = _calculateAPY(user);

        uint256 pendingYield = (userDeposit.amount * apy * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);

        return userDeposit.accruedYield + pendingYield;
    }

    function getCurrentAPY(address user) external view returns (uint256) {
        return _calculateAPY(user);
    }

    function getUserInfo(address user) external view returns (
        uint256 depositAmount,
        uint256 pendingYield,
        uint256 estStaked,
        uint256 currentAPY
    ) {
        UserDeposit storage userDeposit = deposits[user];

        depositAmount = userDeposit.amount;
        estStaked = userDeposit.estStaked;
        currentAPY = _calculateAPY(user);

        if (userDeposit.amount > 0) {
            uint256 timeElapsed = block.timestamp - userDeposit.lastUpdateTime;
            uint256 calculatedYield = (userDeposit.amount * currentAPY * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);
            pendingYield = userDeposit.accruedYield + calculatedYield;
        } else {
            pendingYield = userDeposit.accruedYield;
        }
    }
}
