import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { YieldVault, MockUSDC, EstToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YieldVault", function () {
  let yieldVault: YieldVault;
  let mockUSDC: MockUSDC;
  let estToken: EstToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    const EstToken = await ethers.getContractFactory("EstToken");
    estToken = await EstToken.deploy();

    // Deploy vault
    const YieldVault = await ethers.getContractFactory("YieldVault");
    yieldVault = await YieldVault.deploy(
      await estToken.getAddress(),
      "Estable Yield Vault",
      "eyvUSD"
    );

    // Add USDC as supported asset with 10% mock Morpho APY
    await yieldVault.addAsset(await mockUSDC.getAddress(), 1000);

    // Give users test tokens
    await mockUSDC.connect(user1).faucet();
    await mockUSDC.connect(user2).faucet();
    await estToken.connect(user1).faucet();
    await estToken.connect(user2).faucet();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await yieldVault.name()).to.equal("Estable Yield Vault");
      expect(await yieldVault.symbol()).to.equal("eyvUSD");
    });

    it("Should set correct EST token", async function () {
      expect(await yieldVault.estToken()).to.equal(await estToken.getAddress());
    });

    it("Should have correct constants", async function () {
      expect(await yieldVault.BASE_APY()).to.equal(1000); // 10%
      expect(await yieldVault.BOOSTED_APY()).to.equal(1500); // 15%
      expect(await yieldVault.EST_STAKE_THRESHOLD()).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Asset Management", function () {
    it("Should add supported assets", async function () {
      const MockUSDT = await ethers.getContractFactory("MockUSDT");
      const mockUSDT = await MockUSDT.deploy();

      await yieldVault.addAsset(await mockUSDT.getAddress(), 800);

      expect(await yieldVault.supportedAssets(await mockUSDT.getAddress())).to.be.true;
    });

    it("Should not allow non-owner to add assets", async function () {
      const MockUSDT = await ethers.getContractFactory("MockUSDT");
      const mockUSDT = await MockUSDT.deploy();

      await expect(
        yieldVault.connect(user1).addAsset(await mockUSDT.getAddress(), 800)
      ).to.be.revertedWithCustomError(yieldVault, "OwnableUnauthorizedAccount");
    });

    it("Should not allow duplicate assets", async function () {
      await expect(
        yieldVault.addAsset(await mockUSDC.getAddress(), 800)
      ).to.be.revertedWith("Asset already supported");
    });

    it("Should return supported assets list", async function () {
      const assets = await yieldVault.getSupportedAssets();
      expect(assets.length).to.equal(1);
      expect(assets[0]).to.equal(await mockUSDC.getAddress());
    });

    it("Should return Morpho vault info", async function () {
      const [asset, apy] = await yieldVault.getMorphoVault(await mockUSDC.getAddress());
      expect(asset).to.equal(await mockUSDC.getAddress());
      expect(apy).to.equal(1000);
    });
  });

  describe("Deposits", function () {
    it("Should allow deposits", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());

      expect(await yieldVault.balanceOf(user1.address)).to.equal(depositAmount);
      expect(await yieldVault.totalAssets()).to.equal(depositAmount);
    });

    it("Should not allow deposit of unsupported asset", async function () {
      const MockUSDT = await ethers.getContractFactory("MockUSDT");
      const mockUSDT = await MockUSDT.deploy();

      const depositAmount = ethers.parseUnits("1000", 6);
      await mockUSDT.connect(user1).faucet();
      await mockUSDT.connect(user1).approve(await yieldVault.getAddress(), depositAmount);

      await expect(
        yieldVault.connect(user1).deposit(depositAmount, await mockUSDT.getAddress())
      ).to.be.revertedWith("Asset not supported");
    });

    it("Should not allow zero deposits", async function () {
      await expect(
        yieldVault.connect(user1).deposit(0, await mockUSDC.getAddress())
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should require approval before deposit", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await expect(
        yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress())
      ).to.be.reverted;
    });

    it("Should mint correct shares for first deposit", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());

      // First deposit should be 1:1
      expect(await yieldVault.balanceOf(user1.address)).to.equal(depositAmount);
    });

    it("Should handle multiple deposits correctly", async function () {
      const deposit1 = ethers.parseUnits("1000", 6);
      const deposit2 = ethers.parseUnits("500", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), deposit1 + deposit2);

      await yieldVault.connect(user1).deposit(deposit1, await mockUSDC.getAddress());
      await yieldVault.connect(user1).deposit(deposit2, await mockUSDC.getAddress());

      expect(await yieldVault.totalAssets()).to.equal(deposit1 + deposit2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());
    });

    it("Should allow withdrawals", async function () {
      const shares = await yieldVault.balanceOf(user1.address);
      const initialBalance = await mockUSDC.balanceOf(user1.address);

      await yieldVault.connect(user1).withdraw(shares);

      expect(await yieldVault.balanceOf(user1.address)).to.equal(0);
      expect(await mockUSDC.balanceOf(user1.address)).to.be.gt(initialBalance);
    });

    it("Should not allow zero withdrawals", async function () {
      await expect(
        yieldVault.connect(user1).withdraw(0)
      ).to.be.revertedWith("Shares must be > 0");
    });

    it("Should not allow withdrawal of more shares than owned", async function () {
      const shares = await yieldVault.balanceOf(user1.address);
      const excessShares = shares + 1n;

      await expect(
        yieldVault.connect(user1).withdraw(excessShares)
      ).to.be.revertedWith("Insufficient shares");
    });

    it("Should burn shares on withdrawal", async function () {
      const sharesBefore = await yieldVault.balanceOf(user1.address);
      const withdrawShares = sharesBefore / 2n;

      await yieldVault.connect(user1).withdraw(withdrawShares);

      expect(await yieldVault.balanceOf(user1.address)).to.equal(sharesBefore - withdrawShares);
    });
  });

  describe("Yield Accrual", function () {
    it("Should accrue yield over time", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());

      // Fast forward 1 year
      await time.increase(SECONDS_IN_YEAR);

      const userAssets = await yieldVault.getUserAssets(user1.address);

      // Should be approximately 1100 (1000 + 10% yield)
      const expectedMin = ethers.parseUnits("1099", 6);
      const expectedMax = ethers.parseUnits("1101", 6);

      expect(userAssets).to.be.gte(expectedMin);
      expect(userAssets).to.be.lte(expectedMax);
    });

    it("Should emit YieldAccrued event", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());

      await time.increase(SECONDS_IN_YEAR);

      // Trigger yield accrual through another deposit
      const smallDeposit = ethers.parseUnits("1", 6);
      await mockUSDC.connect(user2).approve(await yieldVault.getAddress(), smallDeposit);

      await expect(
        yieldVault.connect(user2).deposit(smallDeposit, await mockUSDC.getAddress())
      ).to.emit(yieldVault, "YieldAccrued");
    });

    it("Should include yield in withdrawals", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());

      const initialBalance = await mockUSDC.balanceOf(user1.address);

      // Fast forward 1 year
      await time.increase(SECONDS_IN_YEAR);

      const shares = await yieldVault.balanceOf(user1.address);
      await yieldVault.connect(user1).withdraw(shares);

      const finalBalance = await mockUSDC.balanceOf(user1.address);
      const received = finalBalance - initialBalance;

      // Should receive more than deposited (includes yield)
      expect(received).to.be.gt(depositAmount);
    });
  });

  describe("EST Staking", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), depositAmount);
      await yieldVault.connect(user1).deposit(depositAmount, await mockUSDC.getAddress());
    });

    it("Should allow EST staking", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await yieldVault.getAddress(), stakeAmount);
      await yieldVault.connect(user1).stakeEst(stakeAmount);

      expect(await yieldVault.estStaked(user1.address)).to.equal(stakeAmount);
    });

    it("Should not allow zero EST staking", async function () {
      await expect(
        yieldVault.connect(user1).stakeEst(0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should allow EST unstaking", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await yieldVault.getAddress(), stakeAmount);
      await yieldVault.connect(user1).stakeEst(stakeAmount);

      const initialBalance = await estToken.balanceOf(user1.address);

      await yieldVault.connect(user1).unstakeEst(stakeAmount);

      expect(await yieldVault.estStaked(user1.address)).to.equal(0);
      expect(await estToken.balanceOf(user1.address)).to.equal(initialBalance + stakeAmount);
    });

    it("Should return correct APY based on EST staking", async function () {
      // Base APY without staking
      expect(await yieldVault.getCurrentAPY(user1.address)).to.equal(1000);

      // Stake threshold amount
      const stakeAmount = ethers.parseEther("1000");
      await estToken.connect(user1).approve(await yieldVault.getAddress(), stakeAmount);
      await yieldVault.connect(user1).stakeEst(stakeAmount);

      // Should have boosted APY
      expect(await yieldVault.getCurrentAPY(user1.address)).to.equal(1500);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple users correctly", async function () {
      const deposit1 = ethers.parseUnits("1000", 6);
      const deposit2 = ethers.parseUnits("500", 6);

      await mockUSDC.connect(user1).approve(await yieldVault.getAddress(), deposit1);
      await mockUSDC.connect(user2).approve(await yieldVault.getAddress(), deposit2);

      await yieldVault.connect(user1).deposit(deposit1, await mockUSDC.getAddress());
      await yieldVault.connect(user2).deposit(deposit2, await mockUSDC.getAddress());

      expect(await yieldVault.totalAssets()).to.equal(deposit1 + deposit2);
    });

    it("Should return zero user assets for non-depositor", async function () {
      expect(await yieldVault.getUserAssets(user2.address)).to.equal(0);
    });
  });
});
