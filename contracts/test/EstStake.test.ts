import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { EstStake, EstToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EstStake", function () {
  let estStake: EstStake;
  let estToken: EstToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const LOCK_30_DAYS = 30 * 24 * 60 * 60;
  const LOCK_90_DAYS = 90 * 24 * 60 * 60;
  const LOCK_180_DAYS = 180 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const EstToken = await ethers.getContractFactory("EstToken");
    estToken = await EstToken.deploy();

    const EstStake = await ethers.getContractFactory("EstStake");
    estStake = await EstStake.deploy(await estToken.getAddress());

    await estToken.connect(user1).faucet();
    await estToken.connect(user2).faucet();
  });

  describe("Deployment", function () {
    it("Should set correct EST token", async function () {
      expect(await estStake.estToken()).to.equal(await estToken.getAddress());
    });

    it("Should have correct lock periods", async function () {
      expect(await estStake.LOCK_30_DAYS()).to.equal(LOCK_30_DAYS);
      expect(await estStake.LOCK_90_DAYS()).to.equal(LOCK_90_DAYS);
      expect(await estStake.LOCK_180_DAYS()).to.equal(LOCK_180_DAYS);
    });

    it("Should have correct boost multipliers", async function () {
      expect(await estStake.BOOST_30_DAYS()).to.equal(120); // 1.2x
      expect(await estStake.BOOST_90_DAYS()).to.equal(150); // 1.5x
      expect(await estStake.BOOST_180_DAYS()).to.equal(200); // 2.0x
    });
  });

  describe("Staking", function () {
    it("Should allow staking with 30 day lock", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      const stakeInfo = await estStake.stakes(user1.address, 0);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.lockPeriod).to.equal(LOCK_30_DAYS);
      expect(stakeInfo.boost).to.equal(120);
      expect(stakeInfo.active).to.be.true;
    });

    it("Should allow staking with 90 day lock", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_90_DAYS);

      const stakeInfo = await estStake.stakes(user1.address, 0);
      expect(stakeInfo.boost).to.equal(150);
    });

    it("Should allow staking with 180 day lock", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_180_DAYS);

      const stakeInfo = await estStake.stakes(user1.address, 0);
      expect(stakeInfo.boost).to.equal(200);
    });

    it("Should not allow zero staking", async function () {
      await expect(
        estStake.connect(user1).stake(0, LOCK_30_DAYS)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should not allow invalid lock periods", async function () {
      const stakeAmount = ethers.parseEther("100");
      const invalidPeriod = 60 * 24 * 60 * 60; // 60 days

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);

      await expect(
        estStake.connect(user1).stake(stakeAmount, invalidPeriod)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should update total staked", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      expect(await estStake.totalStaked()).to.equal(stakeAmount);
    });

    it("Should increment stake count", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount * 2n);

      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);
      expect(await estStake.stakeCount(user1.address)).to.equal(1);

      await estStake.connect(user1).stake(stakeAmount, LOCK_90_DAYS);
      expect(await estStake.stakeCount(user1.address)).to.equal(2);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("100");
      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);
    });

    it("Should allow unstaking after lock period", async function () {
      await time.increase(LOCK_30_DAYS + 1);

      const initialBalance = await estToken.balanceOf(user1.address);

      await estStake.connect(user1).unstake(0);

      const stakeInfo = await estStake.stakes(user1.address, 0);
      expect(stakeInfo.active).to.be.false;

      const finalBalance = await estToken.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow unstaking before lock period", async function () {
      await time.increase(LOCK_30_DAYS - 1000);

      await expect(
        estStake.connect(user1).unstake(0)
      ).to.be.revertedWith("Lock period not ended");
    });

    it("Should not allow unstaking inactive stakes", async function () {
      await time.increase(LOCK_30_DAYS + 1);
      await estStake.connect(user1).unstake(0);

      await expect(
        estStake.connect(user1).unstake(0)
      ).to.be.revertedWith("Stake not active");
    });

    it("Should update total staked on unstake", async function () {
      await time.increase(LOCK_30_DAYS + 1);

      await estStake.connect(user1).unstake(0);

      expect(await estStake.totalStaked()).to.equal(0);
    });
  });

  describe("Emergency Unstake", function () {
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("100");
      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);
    });

    it("Should allow emergency unstake before lock period", async function () {
      const stakeAmount = ethers.parseEther("100");
      const initialBalance = await estToken.balanceOf(user1.address);

      await estStake.connect(user1).emergencyUnstake(0);

      const finalBalance = await estToken.balanceOf(user1.address);
      const received = finalBalance - initialBalance;

      // Should receive 80% (20% penalty)
      const expectedAmount = (stakeAmount * 80n) / 100n;
      expect(received).to.equal(expectedAmount);
    });

    it("Should not allow emergency unstake after lock period", async function () {
      await time.increase(LOCK_30_DAYS + 1);

      await expect(
        estStake.connect(user1).emergencyUnstake(0)
      ).to.be.revertedWith("Use regular unstake");
    });

    it("Should mark stake as inactive", async function () {
      await estStake.connect(user1).emergencyUnstake(0);

      const stakeInfo = await estStake.stakes(user1.address, 0);
      expect(stakeInfo.active).to.be.false;
    });
  });

  describe("Rewards", function () {
    it("Should accrue rewards over time", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      await time.increase(7 * 24 * 60 * 60); // 7 days

      const pending = await estStake.pendingRewards(user1.address, 0);
      expect(pending).to.be.gt(0);
    });

    it("Should allow claiming rewards", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      // Fund contract with EST for rewards
      await estToken.transfer(await estStake.getAddress(), ethers.parseEther("10000"));

      await time.increase(7 * 24 * 60 * 60);

      const initialBalance = await estToken.balanceOf(user1.address);

      await estStake.connect(user1).claimRewards(0);

      const finalBalance = await estToken.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow claiming zero rewards", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      await expect(
        estStake.connect(user1).claimRewards(0)
      ).to.be.revertedWith("No rewards to claim");
    });
  });

  describe("View Functions", function () {
    it("Should return user stakes", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount * 2n);

      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);
      await estStake.connect(user1).stake(stakeAmount, LOCK_90_DAYS);

      const stakes = await estStake.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);
    });

    it("Should return stake info", async function () {
      const stakeAmount = ethers.parseEther("100");

      await estToken.connect(user1).approve(await estStake.getAddress(), stakeAmount);
      await estStake.connect(user1).stake(stakeAmount, LOCK_30_DAYS);

      const stakeInfo = await estStake.getStakeInfo(user1.address, 0);

      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.lockPeriod).to.equal(LOCK_30_DAYS);
      expect(stakeInfo.boost).to.equal(120);
      expect(stakeInfo.active).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set reward rate", async function () {
      const newRate = ethers.parseUnits("2", 12);

      await estStake.setRewardRate(newRate);

      expect(await estStake.rewardRate()).to.equal(newRate);
    });

    it("Should not allow non-owner to set reward rate", async function () {
      const newRate = ethers.parseUnits("2", 12);

      await expect(
        estStake.connect(user1).setRewardRate(newRate)
      ).to.be.revertedWithCustomError(estStake, "OwnableUnauthorizedAccount");
    });
  });
});
