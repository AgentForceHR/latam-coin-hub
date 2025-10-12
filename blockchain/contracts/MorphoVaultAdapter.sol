// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IMetaMorpho {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
}

contract MorphoVaultAdapter is Ownable, ReentrancyGuard {
    struct VaultInfo {
        address vaultAddress;
        address asset;
        string name;
        bool active;
    }

    mapping(bytes32 => VaultInfo) public vaults;
    mapping(address => mapping(bytes32 => uint256)) public userShares;

    event Deposited(address indexed user, bytes32 indexed vaultId, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, bytes32 indexed vaultId, uint256 amount, uint256 shares);
    event VaultRegistered(bytes32 indexed vaultId, address vaultAddress, address asset, string name);
    event VaultDeactivated(bytes32 indexed vaultId);

    constructor() Ownable(msg.sender) {}

    function registerVault(
        bytes32 vaultId,
        address vaultAddress,
        address asset,
        string memory name
    ) external onlyOwner {
        require(vaultAddress != address(0), "Invalid vault address");
        require(asset != address(0), "Invalid asset address");

        vaults[vaultId] = VaultInfo({
            vaultAddress: vaultAddress,
            asset: asset,
            name: name,
            active: true
        });

        emit VaultRegistered(vaultId, vaultAddress, asset, name);
    }

    function deactivateVault(bytes32 vaultId) external onlyOwner {
        require(vaults[vaultId].vaultAddress != address(0), "Vault does not exist");
        vaults[vaultId].active = false;
        emit VaultDeactivated(vaultId);
    }

    function depositToVault(bytes32 vaultId, uint256 amount) external nonReentrant {
        VaultInfo memory vault = vaults[vaultId];
        require(vault.active, "Vault not active");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 asset = IERC20(vault.asset);
        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        asset.approve(vault.vaultAddress, amount);

        IMetaMorpho morphoVault = IMetaMorpho(vault.vaultAddress);
        uint256 shares = morphoVault.deposit(amount, address(this));

        userShares[msg.sender][vaultId] += shares;

        emit Deposited(msg.sender, vaultId, amount, shares);
    }

    function withdrawFromVault(bytes32 vaultId, uint256 shares) external nonReentrant {
        VaultInfo memory vault = vaults[vaultId];
        require(vault.active, "Vault not active");
        require(shares > 0, "Shares must be greater than 0");
        require(userShares[msg.sender][vaultId] >= shares, "Insufficient shares");

        IMetaMorpho morphoVault = IMetaMorpho(vault.vaultAddress);
        uint256 assets = morphoVault.withdraw(
            morphoVault.convertToAssets(shares),
            msg.sender,
            address(this)
        );

        userShares[msg.sender][vaultId] -= shares;

        emit Withdrawn(msg.sender, vaultId, assets, shares);
    }

    function getUserBalance(address user, bytes32 vaultId) external view returns (uint256) {
        VaultInfo memory vault = vaults[vaultId];
        require(vault.vaultAddress != address(0), "Vault does not exist");

        IMetaMorpho morphoVault = IMetaMorpho(vault.vaultAddress);
        uint256 shares = userShares[user][vaultId];
        return morphoVault.convertToAssets(shares);
    }

    function getUserShares(address user, bytes32 vaultId) external view returns (uint256) {
        return userShares[user][vaultId];
    }

    function getVaultInfo(bytes32 vaultId) external view returns (VaultInfo memory) {
        return vaults[vaultId];
    }
}
