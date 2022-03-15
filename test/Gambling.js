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
    
    it("A user cannot participate with zero GMB token", async function () {
        await expect(gamblingContract.connect(user1).participate(0, 1)).to.be.reverted;
    });

    it("A user cannot participate with less GMB token in his/her account than the one mentioned for participation", async function () {
        await expect(gamblingContract.connect(user1).participate(1, 1)).to.be.reverted;
    });

    it("A user can participate if everything is ok", async function () {
        await GMBContract.transfer(user1.address, 100);
        await expect(gamblingContract.connect(user1).participate(1, 1)).not.to.be.reverted;
    });

    it("A user cannot participate more than once", async function () {
        await GMBContract.transfer(user1.address, 100);
        await expect(gamblingContract.connect(user1).participate(1, 1)).not.to.be.reverted;
        await expect(gamblingContract.connect(user1).participate(1, 1)).to.be.reverted;
    });

    it("GMB token decrease from user account after participation", async function () {
        await GMBContract.transfer(user1.address, 100);
        await gamblingContract.connect(user1).participate(10, 1);
        expect(await GMBContract.balanceOf(user1.address)).to.be.equal(90);
    });

    it("Only admin can call endTurn", async function () {
        await expect(gamblingContract.connect(user1).endTurn()).to.be.reverted;
    });

    it("endTurn cannot be executed without any participant", async function () {
        await expect(gamblingContract.endTurn()).to.be.reverted;
    });

    it("endTurn should be worked if everything is fine", async function () {
        await GMBContract.transfer(user1.address, 100);
        await gamblingContract.connect(user1).participate(10, 1);
        await expect(gamblingContract.endTurn()).not.to.be.reverted;
    });

    it("_correctGuess function should work properly with positive and negative overflow", async function () {
        expect(await gamblingContract._correctGuess(9, 20, 990, 1000)).to.be.true;
        expect(await gamblingContract._correctGuess(991, 20, 9, 1000)).to.be.true;
        expect(await gamblingContract._correctGuess(490, 20, 500, 1000)).to.be.true;
        expect(await gamblingContract._correctGuess(479, 20, 500, 1000)).to.be.false;
    });


});