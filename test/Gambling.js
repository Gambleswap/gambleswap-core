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
    let pair
    let lp
    let tokenAAddress
    let tokenBAddress
    let _user;

    beforeEach(async () => {        
        await hre.network.provider.send("hardhat_reset")
        const {factoryOwnerAddress, lpAddress, user} = await getNamedAccounts();

        _lpAddress = lpAddress
        // _factoryOwnerAddress = factoryAddress
        _user = await ethers.getSigner(user)
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
    
        pair = await GambleswapPair__factory.connect(pairAddress, lp)
        await pair.connect(lp).approve(gambling.address, '9999999999999999999999999999999999999999')

      });
    
    it("A user cannot participate with zero GMB token", async function () {
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });
    
    it("A user cannot participate with not enough LP token", async function () {
        await expect(gambling.connect(lp).participate(0, 1)).to.be.reverted;
    });

    it("A user cannot participate with less GMB token in his/her account than the one mentioned for participation", async function () {
        await expect(gambling.connect(lp).participate(1, 1)).to.be.reverted;
    });

    it("A user can participate if everything is ok", async function () {
        await addLP(lp.address, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks()
        await expect(gambling.connect(lp).participate(1, 1)).not.to.be.reverted;
    });

    it("A user cannot participate more than once", async function () {
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

    it("end to end one round game", async function () {
        await gmb.connect(lp).transfer(_user.address, "10000000");
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        console.log(`${await gmb.balanceOf(_user.address)}`)
        console.log(`${await gmb.balanceOf(_lpAddress)}`)
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        console.log(`in: ${await pair.balanceOf(_lpAddress)}`)
        console.log(`in: ${await pair.balanceOf(_user.address)}`)
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')

        await gambling.connect(_user).participate(2000000, 40);

        await mineBlocks()
        // await gambling.connect(lp).participate(10, 1);
        await claimFromLP(pairAddress, _lpAddress)
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(20000039);
        await gambling.connect(_user).claimPrize(1);
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("11000000")
        // expect(await gmb.balanceOf(_user.address)).to.equal("408")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })

    it("end to end three rounds game", async function () {
        await gmb.connect(lp).transfer(_user.address, "10000000");
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        console.log(`${await gmb.balanceOf(_user.address)}`)
        console.log(`${await gmb.balanceOf(_lpAddress)}`)
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        console.log(`in: ${await pair.balanceOf(_lpAddress)}`)
        console.log(`in: ${await pair.balanceOf(_user.address)}`)
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await mineBlocks()
        await claimFromLP(pairAddress, _lpAddress)

        // Round one
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(20000041);
        await expect(gambling.connect(_user).claimPrize(1)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        await gambling.connect(_user).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("8000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("28018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round two
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(2)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(2)).to.be.reverted
        await gambling.connect(lp).claimLP(2)
        await gambling.connect(_user).claimLP(2)
        expect(await gmb.balanceOf(_user.address)).to.equal("6000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("26018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round three
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(625000010);
        await gambling.connect(_user).claimPrize(3)
        await expect(gambling.connect(lp).claimPrize(3)).to.be.reverted
        await gambling.connect(lp).claimLP(3)
        await expect(gambling.connect(_user).claimLP(3)).to.be.reverted
        expect(await gmb.balanceOf(_user.address)).to.equal("13000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("24018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })


    it("end to end five rounds game", async function () {
        await gmb.connect(lp).transfer(_user.address, "10000000");
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        console.log(`${await gmb.balanceOf(_user.address)}`)
        console.log(`${await gmb.balanceOf(_lpAddress)}`)
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        console.log(`in: ${await pair.balanceOf(_lpAddress)}`)
        console.log(`in: ${await pair.balanceOf(_user.address)}`)
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await mineBlocks()
        await claimFromLP(pairAddress, _lpAddress)

        // Round one
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(20000041);
        await expect(gambling.connect(_user).claimPrize(1)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        await gambling.connect(_user).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("8000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("28018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round two
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(2)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(2)).to.be.reverted
        await gambling.connect(lp).claimLP(2)
        await gambling.connect(_user).claimLP(2)
        expect(await gmb.balanceOf(_user.address)).to.equal("6000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("26018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round three
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(3)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(3)).to.be.reverted
        await gambling.connect(lp).claimLP(3)
        await gambling.connect(_user).claimLP(3)
        expect(await gmb.balanceOf(_user.address)).to.equal("4000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("24018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round four
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(4)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(4)).to.be.reverted
        await gambling.connect(lp).claimLP(4)
        await gambling.connect(_user).claimLP(4)
        expect(await gmb.balanceOf(_user.address)).to.equal("2000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("22018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round five
        await gambling.connect(_user).participate(2000000, 40);
        await gambling.connect(lp).participate(2000000, 1);
        await gambling.emergencyEnd(625000010);
        await gambling.connect(_user).claimPrize(5)
        await expect(gambling.connect(lp).claimPrize(5)).to.be.reverted
        await gambling.connect(lp).claimLP(5)
        await expect(gambling.connect(_user).claimLP(5)).to.be.reverted;
        expect(await gmb.balanceOf(_user.address)).to.equal("3000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("20018290")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })
});