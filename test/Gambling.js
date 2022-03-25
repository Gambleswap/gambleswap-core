const {expect} = require("chai");
const {ethers, getNamedAccounts} = require("hardhat");
const {deployFactory} = require("../scripts/ropsten/deploy_factory");
const {deployTestTokens} = require("../scripts/ropsten/deploy_testTokens");
const {deployGMB} = require("../scripts/ropsten/deploy_gmb");
const {deployRouter} = require("../scripts/ropsten/deploy_router");
const {addLP} = require("../scripts/ropsten/add_lp");
const {deployPair} = require("../scripts/ropsten/deploy_pair");
const {addAuthorisedPool} = require("../scripts/ropsten/add_authorised_pool");
const {claimFromLP} = require("../scripts/ropsten/claim_from_lp");
const {swap} = require("../scripts/ropsten/swap");

async function mineBlocks() {
    let blockNumber = 200;
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

describe("Gambling Contract", function () {

    let GMBAddress;
    let gambling;
    let pairAddress;
    let routerAddress
    let factoryAddress;
    let _lpAddress
    let _factoryOwnerAddress
    let lp
    let tokenAAddress
    let tokenBAddress

    before(async () => {
        const {factoryOwnerAddress, lpAddress} = await getNamedAccounts();

        _lpAddress = lpAddress
        _factoryOwnerAddress = factoryAddress
        
        // const GMB = await ethers.getContractFactory("GMBToken");
        // GMBContract = await GMB.deploy(100000);


        factoryAddress = await deployFactory()
        await mineBlocks()
        tokens = await deployTestTokens()
        tokenAAddress = tokens[0]
        tokenBAddress = tokens[1]
        await mineBlocks()
        GMBAddress = await deployGMB(_lpAddress)
        await mineBlocks

        const Gambling = await ethers.getContractFactory("Gambling");
        gambling = await Gambling.deploy(GMBAddress);

        await mineBlocks()
        routerAddress = await deployRouter()
        await mineBlocks()
        pairAddress = await deployPair()
        await mineBlocks()
        await addAuthorisedPool(pairAddress)
        await mineBlocks()
        lp = await ethers.getSigner(_lpAddress)
      });
    
    it("A user cannot participate with zero GMB token", async function () {
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });
    
    it("A user cannot participate with not enough LP token", async function () {
        // await GMBContract.transfer(user1.address, 100);
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });

    // it("A user cannot participate with less GMB token in his/her account than the one mentioned for participation", async function () {
    //     await expect(gambling.connect(lp).participate(1, 1)).to.be.reverted;
    // });

    it("A user can participate if everything is ok", async function () {
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        // await GMBContract.transfer(user1.address, 100);
        await expect(await gambling.connect(lp).participate(1, 1)).not.to.be.reverted;
    });

    // it("A user cannot participate more than once", async function () {
    //     await GMBContract.transfer(user1.address, 100);
    //     await expect(gamblingContract.connect(user1).participate(1, 1)).not.to.be.reverted;
    //     await expect(gamblingContract.connect(user1).participate(1, 1)).to.be.reverted;
    // });

    // it("GMB token decrease from user account after participation", async function () {
    //     await GMBContract.transfer(user1.address, 100);
    //     await gamblingContract.connect(user1).participate(10, 1);
    //     expect(await GMBContract.balanceOf(user1.address)).to.be.equal(90);
    // });

    // it("Only admin can call endTurn", async function () {
    //     await expect(gamblingContract.connect(user1).endTurn()).to.be.reverted;
    // });

    // it("endTurn cannot be executed without any participant", async function () {
    //     await expect(gamblingContract.endTurn()).to.be.reverted;
    // });

    // it("endTurn should be worked if everything is fine", async function () {
    //     await GMBContract.transfer(user1.address, 100);
    //     await gamblingContract.connect(user1).participate(10, 1);
    //     await expect(gamblingContract.endTurn()).not.to.be.reverted;
    // });

    // it("correctGuess function should work properly with positive and negative overflow", async function () {
    //     expect(await gamblingContract._correctGuess(9, 20, 990, 1000)).to.be.true;
    //     expect(await gamblingContract._correctGuess(991, 20, 9, 1000)).to.be.true;
    //     expect(await gamblingContract._correctGuess(490, 20, 500, 1000)).to.be.true;
    //     expect(await gamblingContract._correctGuess(479, 20, 500, 1000)).to.be.false;
    // });


});