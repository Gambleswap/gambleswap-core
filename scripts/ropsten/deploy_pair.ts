import {UniswapV2Factory, UniswapV2Factory__factory} from '../../types'
import hre from "hardhat";
const { ethers, getChainId, getNamedAccounts} = hre;
const { getSigner} = ethers;

async function main() {

    const {lpAddress, factoryAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const factory:UniswapV2Factory = UniswapV2Factory__factory.connect(factoryAddress, await getSigner(lpAddress));
    console.log(`${await factory.createPair(tokenAddress1, tokenAddress2, {gasLimit: 2100000})}`)

    console.log(`${await factory.allPairs(0)}`)
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });