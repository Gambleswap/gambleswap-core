import {GambleswapFactory, GambleswapFactory__factory} from '../../types'
import hre from "hardhat";
const { ethers, getChainId, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function deployPair() {

    const {lpAddress, factoryAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const factory:GambleswapFactory = GambleswapFactory__factory.connect(factoryAddress, await getSigner(lpAddress));
    console.log(`${await factory.createPair(tokenAddress1, tokenAddress2, {gasLimit: 21000000})}`)

    console.log(`${await factory.allPairs(0)}`)
    console.log(`${await factory.allPairsLength()}`)
}


// deployPair()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });