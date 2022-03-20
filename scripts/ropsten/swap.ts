import {GambleswapRouter, GambleswapRouter__factory, UniToken, UniToken__factory} from '../../types'
import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getSigner} = ethers;

async function main() {

    const {lpAddress, routerAddress} = await getNamedAccounts();

    console.log(lpAddress);
    console.log("==========================================================================================\n");

    const router:GambleswapRouter = GambleswapRouter__factory.connect(routerAddress, await getSigner(lpAddress));
    const rad:UniToken = UniToken__factory.connect("0x7CeE8610dAE21E4627683b05c7a7F67ee8bacF6b", await getSigner(lpAddress));
    const dni:UniToken = UniToken__factory.connect("0xBeDE7de739673DBB075c5d3446Cc9941f4570397", await getSigner(lpAddress));
    console.log(`before: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
    console.log(`${await router.swapExactTokensForTokens('1000', '500', ["0x7CeE8610dAE21E4627683b05c7a7F67ee8bacF6b", "0xBeDE7de739673DBB075c5d3446Cc9941f4570397"], lpAddress, 1746692432, {gasLimit: 2100000})}`)
    console.log(`after: ${await rad.balanceOf(lpAddress)} ${await dni.balanceOf(lpAddress)}`)
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });