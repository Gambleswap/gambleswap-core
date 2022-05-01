import { Gambling__factory, GambleswapLPLending__factory} from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function getPool() {

    const {lendingAddress, userAddress, lpAddress} = await getNamedAccounts();


    const lending = await GambleswapLPLending__factory.connect(lendingAddress, await getSigner(userAddress))

    console.log(`${await lending.pools(1)}`)
    console.log(`${await lending.lenders(1, lpAddress)}`)
    console.log("==========================================================================================\n");

}


getPool()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
