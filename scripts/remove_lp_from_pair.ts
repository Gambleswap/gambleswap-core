import { GambleswapRouter__factory } from './../types/factories/GambleswapRouter__factory';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;

export async function removeLPFromPair() {
    const {lpAddress, routerAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts()


    const router = await GambleswapRouter__factory.connect(routerAddress, await getSigner(lpAddress)) 
    await router.removeLiquidity(tokenAddress1, tokenAddress2, 10, 0, 0, lpAddress, 1746692432, {gasLimit: 2100000})
    console.log("Exited from pair")
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })