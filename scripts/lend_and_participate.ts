import { GambleswapLPLending__factory } from './../types/factories/GambleswapLPLending__factory';
import { Gambling__factory, GambleswapPair__factory, GMBToken__factory } from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function lendAndParticipate(_betValue=undefined, _gmbValue=undefined, _gamblingAddress=undefined, _user=undefined, _pairAddress=undefined, _gmbAddress=undefined) {

    const {userAddress, gamblingAddress, pairAddress, gmbAddress, lendingAddress, lpAddress} = await getNamedAccounts();

    let betValue = _betValue || 40
    let gmbValue = _gmbValue || ethers.utils.parseUnits("20", 18)

    

    const gmb = await GMBToken__factory.connect(gmbAddress, await getSigner(userAddress))
    await gmb.connect(await getSigner(userAddress)).approve(gamblingAddress, '9999999999999999999999999999999999999999')

    const pair = await GambleswapPair__factory.connect(pairAddress, await getSigner(userAddress))
    await pair.connect(await getSigner(userAddress)).approve(gamblingAddress, '9999999999999999999999999999999999999999')
    
    const gambling = await Gambling__factory.connect(gamblingAddress, await getSigner(userAddress))

    const lending = await GambleswapLPLending__factory.connect(lendingAddress, await getSigner(userAddress))
    await gmb.approve(lending.address, '9999999999999999999999999999999999999999')

    const lpBal = await gmb.balanceOf(lpAddress)
    await gmb.connect(await getSigner(lpAddress)).transfer(userAddress, lpBal.div(2))

    await gambling.participate(gmbValue, betValue, true)
    
    console.log("PARTICIPATED\n");
    console.log("==========================================================================================\n");

    // const router:GambleswapRouter = GambleswapRouter__factory.connect(routerAddress, await getSigner(lpAddress));
    // const rad:TestToken = TestToken__factory.connect(tokenAddress1, await getSigner(lpAddress));
    // const dni:TestToken = TestToken__factory.connect(tokenAddress2, await getSigner(lpAddress));
    // await rad.approve(routerAddress, '9999999999999999999999')
    // await dni.approve(routerAddress, '9999999999999999999999')
    // console.log(`before: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
    // console.log(`${await router.swapExactTokensForTokens('1000', '500', [tokenAddress1, tokenAddress2], lpAddress, 1746692432, {gasLimit: 2100000})}`)
    // console.log(`after: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
}


// swap()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });
