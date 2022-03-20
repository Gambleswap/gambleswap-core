import { UniswapV2Router02__factory } from './../../types/factories/GambleswapRouter__factory';
import { IERC20__factory } from './../../types/factories/IERC20__factory';
import { UniswapV2Router02 } from './../../types/GambleswapRouter'
import { IERC20 } from '../../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;

async function main() {

    const {lpAddress, routerAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    console.log("==========================================================================================\n");

    const router:UniswapV2Router02 = await UniswapRouter__factory.connect(routerAddress, await getSigner(lpAddress))
    const rad:IERC20 = await IERC20__factory.connect(tokenAddress1, await getSigner(lpAddress))
    const dni:IERC20 = await IERC20__factory.connect(tokenAddress2, await getSigner(lpAddress))
    await rad.approve(routerAddress, '9999999999999999999999')
    await dni.approve(routerAddress, '9999999999999999999999')
    await router.addLiquidity(tokenAddress1, tokenAddress2,
            '2000000000000000000', '2000000000000000000', 
            '2000000000000000000', '2000000000000000000', 
            lpAddress, 1746692432, {gasLimit: 2100000})
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });