const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");

describe("Gambling Contract", function () {

    let GMBContract;
    let gamblingContract;
    let owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();
        
        const GMB = await ethers.getContractFactory("GMBToken");
        GMBContract = await GMB.deploy();

        const Gambling = await ethers.getContractFactory("Gambling");
        gamblingContract = await Gambling.deploy(GMBContract.address);
      });

    it("Assigns initial balance to the admin", async () => {
        expect(await GMBContract.balanceOf(owner.address)).to.equal(await GMBContract.totalSupply())
    })
      
    
    it("A user cannot transfer without enough credit", async function () {
        await expect(GMBContract.connect(user1).transfer(user2.address, 10)).to.be.reverted;
    });

    it("A user with enough credit can transfer tokens", async function () {
        await GMBContract.transfer(user1.address, 100);
        await expect(GMBContract.connect(user1).transfer(user2.address, 10)).not.to.be.reverted;
    });

    it("Transfer should send the specified tokens to the destination account if everything is fine", async function () {
        await GMBContract.transfer(user1.address, 100);
        await GMBContract.connect(user1).transfer(user2.address, 10);
        expect(await GMBContract.balanceOf(user2.address)).to.be.equal(10);
        expect(await GMBContract.balanceOf(user1.address)).to.be.equal(90);
    });

    it("Transfer should send the specified tokens to the destination account if everything is fine", async function () {
        await GMBContract.transfer(user1.address, 100);
        await GMBContract.connect(user1).transfer(user2.address, 10);
        expect(await GMBContract.balanceOf(user2.address)).to.be.equal(10);
        expect(await GMBContract.balanceOf(user1.address)).to.be.equal(90);
    });

    it("Burn function should decrease burned value from the admin and totalSupply", async function () {
        totalSupply = await GMBContract.totalSupply();
        adminTokens = await GMBContract.balanceOf(owner.address);
        await GMBContract.burn(20);
        expect(await GMBContract.balanceOf(owner.address)).to.be.equal(adminTokens - 20);
        expect(await GMBContract.totalSupply()).to.be.equal(totalSupply - 20);
    });
});