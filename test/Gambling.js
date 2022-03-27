const {GMBToken__factory, GambleswapPair__factory} = require ("../types")

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
const { deployGambling } = require("../scripts/ropsten/deploy_gambling");
const { getSigner } = ethers;

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
    let gmb;
    let _factoryOwnerAddress
    let lp
    let tokenAAddress
    let tokenBAddress

    beforeEach(async () => {        
        await hre.network.provider.send("hardhat_reset")
        const {factoryOwnerAddress, lpAddress} = await getNamedAccounts();

        _lpAddress = lpAddress
        _factoryOwnerAddress = factoryAddress
        lp = await ethers.getSigner(_lpAddress)
        
        // const GMB = await ethers.getContractFactory("GMBToken");
        // GMBContract = await GMB.deploy(100000);


        factoryAddress = await deployFactory()
        await mineBlocks()
        tokens = await deployTestTokens()
        tokenAAddress = tokens[0]
        tokenBAddress = tokens[1]
        await mineBlocks()
        GMBAddress = await deployGMB(_lpAddress)
        gmb = GMBToken__factory.connect(GMBAddress, lp)
        await mineBlocks()

        gambling = await deployGambling(GMBAddress, _lpAddress)
        await mineBlocks()

        await mineBlocks()
        routerAddress = await deployRouter()
        await mineBlocks()
        pairAddress = await deployPair()
        await mineBlocks()
        await addAuthorisedPool(pairAddress)
        await mineBlocks()

        await gmb.connect(lp).approve(gambling.address, '9999999999999999999999999999999999999999')
    
        const pair = await GambleswapPair__factory.connect(pairAddress, lp)
        await pair.connect(lp).approve(gambling.address, '9999999999999999999999999999999999999999')

      });
    
    it("A user cannot participate with zero GMB token", async function () {
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });
    
    it("A user cannot participate with not enough LP token", async function () {
        // await GMBContract.transfer(user1.address, 100);
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });

    it("A user cannot participate with less GMB token in his/her account than the one mentioned for participation", async function () {
        await expect(gambling.connect(lp).participate(1, 1)).to.be.reverted;
    });

    it("A user can participate if everything is ok", async function () {
        await addLP(lp.address, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        // await GMBContract.transfer(user1.address, 100);
        await expect(gambling.connect(lp).participate(1, 1)).not.to.be.reverted;
    });

    it("A user cannot participate more than once", async function () {
        // await GMBContract.transfer(user1.address, 100);
        await addLP(lp.address, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        await expect(gambling.connect(lp).participate(1, 1)).not.to.be.reverted;
        await expect(gambling.connect(lp).participate(1, 1)).to.be.reverted;
    });

    it("GMB token decrease from user account after participation", async function () {
        await addLP(lp.address, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        let beforeAmount = await gmb.balanceOf(_lpAddress)
        await gambling.connect(lp).participate(10, 1);
        let afterNumber = await gmb.balanceOf(_lpAddress)
        expect(afterNumber.toNumber()).to.be.lessThan(beforeAmount.toNumber());
    });

    it("Only admin can call endGame", async function () {
        await addLP(lp.address, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        await gambling.connect(lp).participate(10, 1);
        await mineBlocks()
        await expect(gambling.connect(lp).endGame()).not.to.be.reverted;
    });

    it("endTurn cannot be executed without any participant", async function () {
        await expect(gambling.connect(lp).endGame()).to.be.reverted;
    });

    it("endTurn should be worked if everything is fine", async function () {
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        // await gambling.connect(lp).participate(10, 1);
        await claimFromLP(pairAddress, _lpAddress)
        await gambling.connect(lp).participate(10, 1);
        await expect(gambling.endGame()).not.to.be.reverted;
    });

    it("correctGuess function should work properly with positive and negative overflow", async function () {
        expect(await gambling.correctGuess(9, 20, 990, 1000)).to.be.true;
        expect(await gambling.correctGuess(991, 20, 9, 1000)).to.be.true;
        expect(await gambling.correctGuess(490, 20, 500, 1000)).to.be.true;
        expect(await gambling.correctGuess(479, 20, 500, 1000)).to.be.false;
    });
});