import { expect } from "chai";
import { ethers } from "hardhat";
import { MockUSDC, MockUSDT, EstToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Mock Tokens", function () {
  let mockUSDC: MockUSDC;
  let mockUSDT: MockUSDT;
  let estToken: EstToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();

    const EstToken = await ethers.getContractFactory("EstToken");
    estToken = await EstToken.deploy();
  });

  describe("MockUSDC", function () {
    it("Should have correct name, symbol, and decimals", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USDC");
      expect(await mockUSDC.symbol()).to.equal("mUSDC");
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should mint 1 trillion tokens to deployer", async function () {
      const expectedSupply = ethers.parseUnits("1000000000000", 6); // 1e12 * 1e6
      expect(await mockUSDC.totalSupply()).to.equal(expectedSupply);
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should allow faucet to give 10,000 mUSDC", async function () {
      await mockUSDC.connect(user1).faucet();
      const expectedAmount = ethers.parseUnits("10000", 6);
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(expectedAmount);
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.mint(user1.address, mintAmount);
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(
        mockUSDC.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "OwnableUnauthorizedAccount");
    });

    it("Should allow transfers", async function () {
      await mockUSDC.connect(user1).faucet();
      const transferAmount = ethers.parseUnits("100", 6);
      await mockUSDC.connect(user1).transfer(user2.address, transferAmount);
      expect(await mockUSDC.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should allow approvals", async function () {
      const approveAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.connect(user1).approve(user2.address, approveAmount);
      expect(await mockUSDC.allowance(user1.address, user2.address)).to.equal(approveAmount);
    });
  });

  describe("MockUSDT", function () {
    it("Should have correct name, symbol, and decimals", async function () {
      expect(await mockUSDT.name()).to.equal("Mock USDT");
      expect(await mockUSDT.symbol()).to.equal("mUSDT");
      expect(await mockUSDT.decimals()).to.equal(6);
    });

    it("Should mint 1 trillion tokens to deployer", async function () {
      const expectedSupply = ethers.parseUnits("1000000000000", 6);
      expect(await mockUSDT.totalSupply()).to.equal(expectedSupply);
    });

    it("Should allow faucet to give 10,000 mUSDT", async function () {
      await mockUSDT.connect(user1).faucet();
      const expectedAmount = ethers.parseUnits("10000", 6);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(expectedAmount);
    });
  });

  describe("EstToken", function () {
    it("Should have correct name, symbol, and decimals", async function () {
      expect(await estToken.name()).to.equal("Estable");
      expect(await estToken.symbol()).to.equal("EST");
      expect(await estToken.decimals()).to.equal(18);
    });

    it("Should mint 1 billion tokens to deployer", async function () {
      const expectedSupply = ethers.parseEther("1000000000"); // 1e9 * 1e18
      expect(await estToken.totalSupply()).to.equal(expectedSupply);
      expect(await estToken.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should allow faucet to give 1,000 EST", async function () {
      await estToken.connect(user1).faucet();
      const expectedAmount = ethers.parseEther("1000");
      expect(await estToken.balanceOf(user1.address)).to.equal(expectedAmount);
    });

    it("Should allow burning tokens", async function () {
      await estToken.connect(user1).faucet();
      const initialBalance = await estToken.balanceOf(user1.address);
      const burnAmount = ethers.parseEther("100");

      await estToken.connect(user1).burn(burnAmount);

      expect(await estToken.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await estToken.mint(user1.address, mintAmount);
      expect(await estToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        estToken.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(estToken, "OwnableUnauthorizedAccount");
    });
  });
});
