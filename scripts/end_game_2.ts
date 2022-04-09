import { Gambling__factory, GambleswapPair__factory, GMBToken__factory } from './../types';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function endGame(_number=undefined, _gamblingAddress=undefined, _user=undefined, _factoryOwnerAddress=undefined) {

    const {lpAddress, gamblingAddress, factoryOwnerAddress} = await getNamedAccounts();
    let gA = _gamblingAddress || gamblingAddress
    let user = _user || lpAddress
    let fOA = _factoryOwnerAddress || lpAddress
    let number = _number || 40 

    const gambling = await Gambling__factory.connect(gA, await getSigner(fOA))

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
