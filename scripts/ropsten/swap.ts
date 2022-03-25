import {GambleswapRouter, GambleswapRouter__factory, TestToken, TestToken__factory} from '../../types'
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function swap() {

    const {lpAddress, routerAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    console.log(lpAddress);
    console.log("==========================================================================================\n");

    const router:GambleswapRouter = GambleswapRouter__factory.connect(routerAddress, await getSigner(lpAddress));
    const rad:TestToken = TestToken__factory.connect(tokenAddress1, await getSigner(lpAddress));
    const dni:TestToken = TestToken__factory.connect(tokenAddress2, await getSigner(lpAddress));
    await rad.approve(routerAddress, '9999999999999999999999')
    await dni.approve(routerAddress, '9999999999999999999999')
    console.log(`before: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
    console.log(`${await router.swapExactTokensForTokens('1000', '500', [tokenAddress1, tokenAddress2], lpAddress, 1746692432, {gasLimit: 2100000})}`)
    console.log(`after: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
}


// swap()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });