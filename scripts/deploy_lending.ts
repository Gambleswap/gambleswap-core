import { GMBToken__factory } from './../types/factories/GMBToken__factory';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;
import {Gambling__factory } from "../types";

export async function deployLending() {
    const {factoryOwnerAddress, gamblingAddress, gmbAddress} = await getNamedAccounts()

    const Lending = await ethers.getContractFactory("GambleswapLPLending");
    const lending = await Lending.connect(await getSigner(factoryOwnerAddress)).deploy(gmbAddress, gamblingAddress);
    let gmb = await GMBToken__factory.connect(gmbAddress, await getSigner(factoryOwnerAddress))
    let gambling = await Gambling__factory.connect(gamblingAddress, await getSigner(factoryOwnerAddress))
    await gambling.setLending(lending.address)
    await gmb.approve(lending.address, "9999999999999999999999999999999")
    console.log(`Lending contract deployed at ${lending.address}`)
    return lending
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })