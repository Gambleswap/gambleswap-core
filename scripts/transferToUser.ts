import {GambleswapPair, GambleswapPair__factory, GMBToken, GMBToken__factory, GambleswapERC20, GambleswapERC20__factory} from '../types'
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function transferToUser() {

    const {lpAddress, gmbAddress, pairAddress, userAddress, gamblingAddress} = await getNamedAccounts();

    console.log(lpAddress);
    console.log("==========================================================================================\n");

    const gmb:GMBToken = GMBToken__factory.connect(gmbAddress, await getSigner(lpAddress));
    const lpBal = await gmb.balanceOf(lpAddress)
    await gmb.transfer(userAddress, lpBal.div(2))

    const pair:GambleswapPair = GambleswapPair__factory.connect(pairAddress, await getSigner(lpAddress));
    const pairBal = await pair.balanceOf(lpAddress)
    await pair.transfer(userAddress, pairBal.div(2))

    const pairERC20:GambleswapERC20 = GambleswapERC20__factory.connect(pairAddress, await getSigner(userAddress));
    const gmbERC20:GambleswapERC20 = GambleswapERC20__factory.connect(gmbAddress, await getSigner(userAddress));
    await pairERC20.approve(gamblingAddress, "99999999999999999999999999999")
    await gmbERC20.approve(gamblingAddress, "99999999999999999999999999999")

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