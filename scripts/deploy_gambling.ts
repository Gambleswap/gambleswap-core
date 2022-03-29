import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;
import { GMBToken__factory } from "../types";

export async function deployGambling(_gmbAddress=undefined, _lpAddress=undefined) {
    const {lpAddress, gmbAddress} = await getNamedAccounts()

    let GMBAddress = _gmbAddress || gmbAddress
    let lpA = _lpAddress || lpAddress

    const Gambling = await ethers.getContractFactory("Gambling");
    const gambling = await Gambling.connect(await getSigner(lpA)).deploy(GMBAddress);
    let gmb = await GMBToken__factory.connect(GMBAddress, await getSigner(lpA))
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