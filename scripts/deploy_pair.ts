import {GambleswapFactory, GambleswapFactory__factory, GambleswapPair, GambleswapPair__factory} from '../types'
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function deployPair() {

    const {lpAddress, factoryAddress, tokenAddress1, tokenAddress2, factoryOwnerAddress} = await getNamedAccounts();

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const factory:GambleswapFactory = GambleswapFactory__factory.connect(factoryAddress, await getSigner(lpAddress));
    console.log(`${await factory.createPair(tokenAddress1, tokenAddress2, {gasLimit: 21000000})}`)
    const pAdd = await factory.allPairs(0);

    const pair:GambleswapPair = GambleswapPair__factory.connect(pAdd, await getSigner(factoryOwnerAddress));
    console.log(`${await pair.changeMintingAmount(10)}`)
    console.log(`pair address: ${pAdd}`)

    return pAdd
}


// deployPair()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });