import { GambleswapRouter__factory } from './../types/factories/GambleswapRouter__factory';
import { IERC20__factory } from './../types/factories/IERC20__factory';
import { GambleswapRouter } from './../types/GambleswapRouter'
import { IERC20 } from '../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;

export async function addLP(_lpAddress=undefined, _routerAddress=undefined, _tokenA=undefined, _tokenB=undefined) {

    const {lpAddress, routerAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    let lpA = _lpAddress || lpAddress
    let rA = _routerAddress || routerAddress
    let tA = _tokenA || tokenAddress1
    let tB = _tokenB || tokenAddress2
    
    console.log("==========================================================================================\n");

    const router:GambleswapRouter = await GambleswapRouter__factory.connect(rA, await getSigner(lpA))
    const rad:IERC20 = await IERC20__factory.connect(tA, await getSigner(lpA))
    const dni:IERC20 = await IERC20__factory.connect(tB, await getSigner(lpA))
    await rad.approve(rA, '9999999999999999999999')
    await dni.approve(rA, '9999999999999999999999')
    await router.addLiquidity(tA, tB,
            '2000000000000000000', '2000000000000000000', 
            '1000000000000000000', '1000000000000000000', 
            lpA, 1746692432, {gasLimit: 2100000})
}


// addLP()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });