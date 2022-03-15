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
});