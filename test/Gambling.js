const {GMBToken__factory, GambleswapPair__factory, IGambleswapERC20__factory, IGMBToken__factory, IERC20__factory} = require ("../types")
const BigNumber = require('big-number');
const {expect, assert} = require("chai");
const {ethers, getNamedAccounts} = require("hardhat");
const {deployFactory} = require("../scripts/deploy_factory");
const {deployTestTokens} = require("../scripts/deploy_testTokens");
const {deployGMB} = require("../scripts/deploy_gmb");
const {deployRouter} = require("../scripts/deploy_router");
const {addLP} = require("../scripts/add_lp");
const {deployPair} = require("../scripts/deploy_pair");
const {addAuthorisedPool} = require("../scripts/add_authorised_pool");
const {claimFromLP} = require("../scripts/claim_from_lp");
const {swap} = require("../scripts/swap");
const { deployGambling } = require("../scripts/deploy_gambling");
const { deployLending } = require("../scripts/deploy_lending");
const { getSigner } = ethers;

async function mineBlocks(blockNumber) {
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
    let owner;
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
        owner = await ethers.getSigner(factoryOwnerAddress)
        
        // const GMB = await ethers.getContractFactory("GMBToken");
        // GMBContract = await GMB.deploy(100000);


        GMBAddress = await deployGMB()
        gambling = await deployGambling()
        lending = await deployLending()

        factoryAddress = await deployFactory()
        await mineBlocks(2)
        tokens = await deployTestTokens()
        tokenAAddress = tokens[0]
        tokenBAddress = tokens[1]
        await mineBlocks(2)
        gmb = GMBToken__factory.connect(GMBAddress, lp)
        await mineBlocks(2)

        await mineBlocks(2)
        routerAddress = await deployRouter()
        await mineBlocks(2)
        pairAddress = await deployPair()
        await mineBlocks(2)
        await addAuthorisedPool(pairAddress)
        await mineBlocks(2)

        await gmb.connect(lp).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(lending.address, '9999999999999999999999999999999999999999')
    
        pair = await GambleswapPair__factory.connect(pairAddress, lp)
        await pair.connect(lp).approve(gambling.address, '9999999999999999999999999999999999999999')
        await pair.connect(lp).approve(lending.address, '9999999999999999999999999999999999999999')
        await pair.connect(_user).approve(lending.address, '9999999999999999999999999999999999999999')

      });
    
    it("A user cannot participate with zero GMB token", async function () {
        await expect(gambling.connect(lp).participate(0, 1, false)).to.be.reverted;
    });
    
    it("A user cannot participate with not enough LP token", async function () {
        await expect(gambling.connect(lp).participate(0, 1, false)).to.be.reverted;
    });

    it("A user cannot participate with less GMB token in his/her account than the one mentioned for participation", async function () {
        await expect(gambling.connect(lp).participate(1, 1, false)).to.be.reverted;
    });

    it("A user can participate if everything is ok", async function () {

        await addLP()
        await claimFromLP();

        await gambling.connect(lp).participate(1, 1, false)
        await mineBlocks(2)
    });

    it("A user cannot participate more than once", async function () {
        await addLP()
        await claimFromLP();
    await mineBlocks(2)
        await expect(gambling.connect(lp).participate(1, 1, false)).not.to.be.reverted;
        await expect(gambling.connect(lp).participate(1, 1, false)).to.be.reverted;
    });

    it("GMB token decrease from user account after participation", async function () {
        await addLP()
        await claimFromLP();
    await mineBlocks(2)
        let beforeAmount = BigNumber(await gmb.balanceOf(_lpAddress) + "")
        await gambling.connect(lp).participate("100000000000000000000", 100, false); // Consider the force claim
        let afterNumber = BigNumber(await gmb.balanceOf(_lpAddress) + "")
        assert(beforeAmount.gt(afterNumber), "After amount isn't less than before amount.")
        // expect(afterNumber.toNumber()).to.be.lessThan(beforeAmount.toNumber());
    });

    it("Only admin can call endGame", async function () {
        await addLP()
        await claimFromLP();
    await mineBlocks(2)
        await gambling.connect(lp).participate(10, 1, false);
    await mineBlocks(2)
        await expect(gambling.connect(owner).endGame()).not.to.be.reverted;
    });

    it("endTurn cannot be executed without any participant", async function () {
        await expect(gambling.connect(owner).endGame()).to.be.reverted;
    });

    it("endTurn should work if everything is fine", async function () {
        await addLP()
        await claimFromLP();
        await mineBlocks(2)
        // await gambling.connect(lp).participate(10, 1);
        await claimFromLP(pairAddress, _lpAddress)
        await gambling.connect(lp).participate("100000000000000000000", 1, false);
        await expect(gambling.endGame()).not.to.be.reverted;
    });

    it("correctGuess function should work properly with positive and negative overflow", async function () {
        expect(await gambling.correctGuess(9, 20, 990, 1000)).to.be.true;
        expect(await gambling.correctGuess(991, 20, 9, 1000)).to.be.true;
        expect(await gambling.correctGuess(490, 20, 500, 1000)).to.be.true;
        expect(await gambling.correctGuess(479, 20, 500, 1000)).to.be.false;
    });

    it("end to end one round game", async function () {
        await addLP()
        await claimFromLP();
        await mineBlocks(2)
        await gmb.connect(lp).transfer(_user.address, "50000000000000000000");
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')

        await gambling.connect(_user).participate("20000000000000000000", 40, false);

        await mineBlocks(2)
        // await gambling.connect(lp).participate(10, 1);
        await claimFromLP(pairAddress, _lpAddress)
        await gambling.connect(lp).participate("20000000000000000000", 1, false);
        await gambling.emergencyEnd(239);
        await gambling.connect(_user).claimPrize(1);
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("60000000000000000000")
        // expect(await gmb.balanceOf(_user.address)).to.equal("408")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })

    it("end to end three rounds game", async function () {
        const amount = ethers.utils.parseUnits('1', 22)
        const amountTransfer = ethers.utils.parseUnits('1', 23)
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks(20000)
        await claimFromLP();
        await gmb.connect(lp).transfer(_user.address, amountTransfer);
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await mineBlocks(2)
        await claimFromLP(pairAddress, _lpAddress)

        // Round one
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(100041);
        await expect(gambling.connect(_user).claimPrize(1)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        await gambling.connect(_user).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("90000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("90229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round two
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(2)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(2)).to.be.reverted
        await gambling.connect(lp).claimLP(2)
        await gambling.connect(_user).claimLP(2)
        expect(await gmb.balanceOf(_user.address)).to.equal("80000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("80229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round three
        await gambling.connect(_user).participate(amount, 75000001, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(700000000);
        await gambling.connect(_user).claimPrize(3)
        await expect(gambling.connect(lp).claimPrize(3)).to.be.reverted
        await gambling.connect(lp).claimLP(3)
        await expect(gambling.connect(_user).claimLP(3)).to.be.reverted
        expect(await gmb.balanceOf(_user.address)).to.equal("115000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("70229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })


    it("end to end five rounds game", async function () {
        const amount = ethers.utils.parseUnits('1', 22)
        const amountTransfer = ethers.utils.parseUnits('1', 23)
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks(20000)
        await claimFromLP();
        await gmb.connect(lp).transfer(_user.address, amountTransfer);
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await mineBlocks(2)
        await claimFromLP(pairAddress, _lpAddress)

        // Round one
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(100041);
        await expect(gambling.connect(_user).claimPrize(1)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        await gambling.connect(_user).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("90000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("90229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round two
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(2)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(2)).to.be.reverted
        await gambling.connect(lp).claimLP(2)
        await gambling.connect(_user).claimLP(2)
        expect(await gmb.balanceOf(_user.address)).to.equal("80000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("80229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round three
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(3)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(3)).to.be.reverted
        await gambling.connect(lp).claimLP(3)
        await gambling.connect(_user).claimLP(3)
        expect(await gmb.balanceOf(_user.address)).to.equal("70000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("70229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round four
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(4)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(4)).to.be.reverted
        await gambling.connect(lp).claimLP(4)
        await gambling.connect(_user).claimLP(4)
        expect(await gmb.balanceOf(_user.address)).to.equal("60000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("60229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round five
        await gambling.connect(_user).participate(amount, 75000001, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(700000000);
        await gambling.connect(_user).claimPrize(5)
        await expect(gambling.connect(lp).claimPrize(5)).to.be.reverted
        await gambling.connect(lp).claimLP(5)
        await expect(gambling.connect(_user).claimLP(5)).to.be.reverted
        expect(await gmb.balanceOf(_user.address)).to.equal("65000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("50229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")
    })


    it("end to end five rounds game with lending", async function () {
        const amount = ethers.utils.parseUnits('1', 22)
        const amountTransfer = ethers.utils.parseUnits('1', 23)
        await addLP(_lpAddress, routerAddress, tokenAAddress, tokenBAddress)
        await mineBlocks(20000)
        await claimFromLP();
        await gmb.connect(lp).transfer(_user.address, amountTransfer);
        await pair.connect(lp).transfer(_user.address, "999999999999999");
        await pair.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await gmb.connect(_user).approve(gambling.address, '9999999999999999999999999999999999999999')
        await mineBlocks(2)
        await claimFromLP(pairAddress, _lpAddress)

        // Round one
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(100041);
        await expect(gambling.connect(_user).claimPrize(1)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(1)).to.be.reverted
        await gambling.connect(lp).claimLP(1)
        await gambling.connect(_user).claimLP(1)
        expect(await gmb.balanceOf(_user.address)).to.equal("90000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("90229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round two
        await gambling.connect(_user).participate(amount, 40, false);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(2)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(2)).to.be.reverted
        await gambling.connect(lp).claimLP(2)
        await gambling.connect(_user).claimLP(2)
        expect(await gmb.balanceOf(_user.address)).to.equal("80000000000000000000000")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("80229974999999899885025")
        expect(await pair.balanceOf(_user.address)).to.equal("999999999999999")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1998999999999999001")

        // Round three
        let balance;
        balance = await pair.balanceOf(_user.address)
        pair.connect(_user).transfer(lp.address, balance)
        balance = await pair.balanceOf(lp.address)
        await lending.connect(lp).lend(1, balance.div(2))
        await gambling.connect(_user).participate(amount, 40, true);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(3)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(3)).to.be.reverted
        await gambling.connect(lp).claimLP(3)
        await gambling.connect(_user).claimLP(3)
        expect(await gmb.balanceOf(_user.address)).to.equal("69990099999999999999900")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("70379899999999899810100")
        expect(await pair.balanceOf(_user.address)).to.equal("0")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1000499999999999500")

        // Round four
        await expect(gambling.connect(_user).participate(amount, 40, false)).to.be.reverted
        await gambling.connect(_user).participate(amount, 40, true);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(626000000);
        await expect(gambling.connect(_user).claimPrize(4)).to.be.reverted
        await expect(gambling.connect(lp).claimPrize(4)).to.be.reverted
        await gambling.connect(lp).claimLP(4)
        await gambling.connect(_user).claimLP(4)
        expect(await gmb.balanceOf(_user.address)).to.equal("59980099999999999999900")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("60379899999999899810100")
        expect(await pair.balanceOf(_user.address)).to.equal("0")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1000499999999999500")

        // Round five
        await gambling.connect(_user).participate(amount, 75000001, true);
        await gambling.connect(lp).participate(amount, 1, false);
        await gambling.emergencyEnd(700000000);
        await gambling.connect(_user).claimPrize(5)
        await expect(gambling.connect(lp).claimPrize(5)).to.be.reverted
        await gambling.connect(lp).claimLP(5)
        await expect(gambling.connect(_user).claimLP(5)).to.be.reverted
        expect(await gmb.balanceOf(_user.address)).to.equal("64970099999999999999900")
        expect(await gmb.balanceOf(_lpAddress)).to.equal("50379899999999899810100")
        expect(await pair.balanceOf(_user.address)).to.equal("0")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1000499999999999500")
        await lending.connect(lp).exitLendingPool(1)
        expect(await gmb.balanceOf(_lpAddress)).to.equal("50409899999999897920092")
        expect(await pair.balanceOf(_lpAddress)).to.equal("1999999999999999000")
        
    })
});