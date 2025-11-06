// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldVault
 * @dev Vault contract with share-based accounting and yield accrual
 * Supports multiple stablecoin assets and EST staking for APY boost
 */
contract YieldVault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant BASE_APY = 1000; // 10% in basis points
    uint256 public constant BOOSTED_APY = 1500; // 15% in basis points
    uint256 public constant APY_DENOMINATOR = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant EST_STAKE_THRESHOLD = 1000 * 10**18; // 1000 EST tokens

    // Supported assets
    mapping(address => bool) public supportedAssets;
    address[] public assetList;

    // EST token for staking boost
    IERC20 public immutable estToken;

    // User staking info
    mapping(address => uint256) public estStaked;
    mapping(address => uint256) public lastUpdateTime;

    // Vault state
    uint256 public totalAssets;
    uint256 public lastYieldUpdate;
    uint256 public accumulatedYield;

    // Mock Morpho vault data
    struct MorphoVault {
        address asset;
        uint256 apy; // in basis points (e.g., 500 = 5%)
    }

    mapping(address => MorphoVault) public morphoVaults;

    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event YieldAccrued(uint256 amount, uint256 timestamp);
    event EstStaked(address indexed user, uint256 amount);
    event EstUnstaked(address indexed user, uint256 amount);
    event AssetAdded(address indexed asset, uint256 morphoApy);

    constructor(
        address _estToken,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_estToken != address(0), "Invalid EST token");
        estToken = IERC20(_estToken);
        lastYieldUpdate = block.timestamp;
    }

    /**
     * @dev Add supported asset with mock Morpho APY
     * @param asset Asset token address
     * @param morphoApy APY in basis points (e.g., 500 = 5%)
     */
    function addAsset(address asset, uint256 morphoApy) external onlyOwner {
        require(asset != address(0), "Invalid asset");
        require(!supportedAssets[asset], "Asset already supported");
        require(morphoApy <= 2000, "APY too high"); // Max 20%

        supportedAssets[asset] = true;
        assetList.push(asset);
        morphoVaults[asset] = MorphoVault({
            asset: asset,
            apy: morphoApy
        });

        emit AssetAdded(asset, morphoApy);
    }

    /**
     * @dev Deposit stablecoins and receive vault shares
     * @param amount Amount to deposit
     * @param token Token address to deposit
     */
    function deposit(uint256 amount, address token) external nonReentrant {
        require(supportedAssets[token], "Asset not supported");
        require(amount > 0, "Amount must be > 0");

        // Accrue yield before deposit
        _accrueInterest();

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate shares to mint
        uint256 shares = _calculateShares(amount);

        // Mint shares to user
        _mint(msg.sender, shares);

        // Update total assets
        totalAssets += amount;

        // Update user's last update time
        lastUpdateTime[msg.sender] = block.timestamp;

        emit Deposit(msg.sender, token, amount, shares);
    }

    /**
     * @dev Withdraw stablecoins by burning vault shares
     * @param shares Amount of shares to burn
     */
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Shares must be > 0");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");

        // Accrue yield before withdrawal
        _accrueInterest();

        // Calculate amount to return (includes accrued yield)
        uint256 amount = _calculateAssets(shares);

        // Burn shares from user
        _burn(msg.sender, shares);

        // Update total assets
        totalAssets -= amount;

        // Transfer first supported asset (simplified for testing)
        require(assetList.length > 0, "No assets available");
        address asset = assetList[0];
        IERC20(asset).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, asset, amount, shares);
    }

    /**
     * @dev Stake EST tokens to boost APY
     * @param amount Amount of EST to stake
     */
    function stakeEst(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // Transfer EST from user
        estToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update staked amount
        estStaked[msg.sender] += amount;

        emit EstStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake EST tokens
     * @param amount Amount of EST to unstake
     */
    function unstakeEst(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(estStaked[msg.sender] >= amount, "Insufficient staked EST");

        // Update staked amount
        estStaked[msg.sender] -= amount;

        // Transfer EST back to user
        estToken.safeTransfer(msg.sender, amount);

        emit EstUnstaked(msg.sender, amount);
    }

    /**
     * @dev Get current APY for user based on EST staking
     * @param user User address
     * @return Current APY in basis points
     */
    function getCurrentAPY(address user) public view returns (uint256) {
        if (estStaked[user] >= EST_STAKE_THRESHOLD) {
            return BOOSTED_APY;
        }
        return BASE_APY;
    }

    /**
     * @dev Get user's share of total assets including accrued yield
     * @param user User address
     * @return User's asset amount
     */
    function getUserAssets(address user) external view returns (uint256) {
        uint256 userShares = balanceOf(user);
        if (userShares == 0 || totalSupply() == 0) {
            return 0;
        }

        // Calculate pending yield
        uint256 pendingYield = _calculatePendingYield();
        uint256 totalWithYield = totalAssets + accumulatedYield + pendingYield;

        return (userShares * totalWithYield) / totalSupply();
    }

    /**
     * @dev Private function to accrue interest based on time elapsed
     * Uses block.timestamp for yield calculation
     */
    function _accrueInterest() private {
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;

        if (timeElapsed == 0 || totalAssets == 0) {
            lastYieldUpdate = block.timestamp;
            return;
        }

        // Use average APY across all users (simplified)
        uint256 apy = BASE_APY;

        // Calculate yield: (totalAssets * APY * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR)
        uint256 yield = (totalAssets * apy * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);

        // Accumulate yield
        accumulatedYield += yield;
        totalAssets += yield;

        lastYieldUpdate = block.timestamp;

        emit YieldAccrued(yield, block.timestamp);
    }

    /**
     * @dev Calculate pending yield since last update
     */
    function _calculatePendingYield() private view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;

        if (timeElapsed == 0 || totalAssets == 0) {
            return 0;
        }

        uint256 apy = BASE_APY;
        return (totalAssets * apy * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);
    }

    /**
     * @dev Calculate shares to mint for deposit amount
     * @param assets Amount of assets being deposited
     * @return shares Amount of shares to mint
     */
    function _calculateShares(uint256 assets) private view returns (uint256 shares) {
        uint256 supply = totalSupply();

        if (supply == 0) {
            // First deposit: 1:1 ratio
            shares = assets;
        } else {
            // Subsequent deposits: maintain ratio
            uint256 totalWithYield = totalAssets + accumulatedYield;
            shares = (assets * supply) / totalWithYield;
        }
    }

    /**
     * @dev Calculate assets to return for share amount
     * @param shares Amount of shares being burned
     * @return assets Amount of assets to return
     */
    function _calculateAssets(uint256 shares) private view returns (uint256 assets) {
        uint256 supply = totalSupply();
        require(supply > 0, "No shares exist");

        uint256 totalWithYield = totalAssets + accumulatedYield;
        assets = (shares * totalWithYield) / supply;
    }

    /**
     * @dev Get list of supported assets
     */
    function getSupportedAssets() external view returns (address[] memory) {
        return assetList;
    }

    /**
     * @dev Get Morpho vault info for asset
     */
    function getMorphoVault(address asset) external view returns (address, uint256) {
        MorphoVault memory vault = morphoVaults[asset];
        return (vault.asset, vault.apy);
    }
}
