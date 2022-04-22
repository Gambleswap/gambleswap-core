import { GambleswapERC20__factory } from './../types/factories/GambleswapERC20__factory';
import { GMBToken__factory } from './../types/factories/GMBToken__factory';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;
import {GambleswapLPLending__factory, Gambling__factory } from "../types";

export async function addLPToLending() {
    const {lpAddress, lendingAddress, pairAddress} = await getNamedAccounts()

    let lending = await GambleswapLPLending__factory.connect(lendingAddress, await getSigner(lpAddress))
    let pair = await GambleswapERC20__factory.connect(pairAddress, await getSigner(lpAddress))

    await pair.approve(lending.address, "9999999999999999999999999999999")
    let balance = await pair.balanceOf(lpAddress)

    await lending.lend(1, balance.div(2));
    return lending
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })