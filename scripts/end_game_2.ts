import { Gambling__factory, GambleswapPair__factory, GMBToken__factory } from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function endGame() {

    const {gamblingAddress, factoryOwnerAddress} = await getNamedAccounts();
    let number = 40 

    const gambling = await Gambling__factory.connect(gamblingAddress, await getSigner(factoryOwnerAddress))

    await gambling.emergencyEnd(number)

    console.log(`Round is ended with ${number}.\n`);
    console.log("==========================================================================================\n");

}


endGame()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
