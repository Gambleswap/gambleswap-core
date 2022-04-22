import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;
import { GMBToken__factory } from "../types";

export async function deployGambling() {
    const {factoryOwnerAddress, gmbAddress} = await getNamedAccounts()

    const Gambling = await ethers.getContractFactory("Gambling");
    const gambling = await Gambling.connect(await getSigner(factoryOwnerAddress)).deploy(gmbAddress);
    let gmb = await GMBToken__factory.connect(gmbAddress, await getSigner(factoryOwnerAddress))
    await gmb.setGamblingContractAddress(gambling.address)
    console.log(`Gambling contract deployed at ${gambling.address}`)
    return gambling
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })