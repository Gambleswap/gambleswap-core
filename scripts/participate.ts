import { Gambling__factory, GambleswapPair__factory, GMBToken__factory } from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function participate(_betValue=undefined, _gmbValue=undefined, _gamblingAddress=undefined, _user=undefined, _pairAddress=undefined, _gmbAddress=undefined) {

    const {lpAddress, gamblingAddress, pairAddress, gmbAddress} = await getNamedAccounts();
    let gA = _gamblingAddress || gamblingAddress
    let user = _user || lpAddress
    let pA = _pairAddress || pairAddress
    let gmbA = _gmbAddress || gmbAddress
    let betValue = _betValue || 40
    let gmbValue = _gmbValue || ethers.utils.parseUnits("200", 18)

    

    const gmb = await GMBToken__factory.connect(gmbA, await getSigner(user))
    await gmb.connect(await getSigner(user)).approve(gA, '9999999999999999999999999999999999999999')

    const pair = await GambleswapPair__factory.connect(pA, await getSigner(user))
    await pair.connect(await getSigner(user)).approve(gA, '9999999999999999999999999999999999999999')
    
    const gambling = await Gambling__factory.connect(gA, await getSigner(user))

    // await gambling.participate(gmbValue, betValue)

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
