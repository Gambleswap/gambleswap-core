import { GambleswapLPLending__factory } from './../types/factories/GambleswapLPLending__factory';
import { Gambling__factory, GambleswapPair__factory, GMBToken__factory } from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function main() {

    const {lpAddress, lendingAddress, pairAddress, gmbAddress, gamblingAddress} = await getNamedAccounts();


    

    const gambling = await Gambling__factory.connect(gamblingAddress, await getSigner(lpAddress))
    const lending = await GambleswapLPLending__factory.connect(lendingAddress, await getSigner(lpAddress))
    const pair = await GambleswapPair__factory.connect(pairAddress, await getSigner(lpAddress))
    console.log(`${await pair.connect(await getSigner(lpAddress)).balanceOf(lpAddress)}`)
    console.log(`${await lending.connect(await getSigner(lpAddress)).getLentAmount(lpAddress, pairAddress)}`)
    console.log(`${await gambling.connect(await getSigner(lpAddress)).getRecentGamesLPAmount(2, lpAddress, pairAddress)}`)

    // const pair = await GambleswapPair__factory.connect(pA, await getSigner(user))
    // await pair.connect(await getSigner(user)).approve(gA, '9999999999999999999999999999999999999999')
    
    // const gambling = await Gambling__factory.connect(gA, await getSigner(user))

    // await gambling.participate(gmbValue, betValue, false)

    // console.log("PARTICIPATED\n");
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


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
