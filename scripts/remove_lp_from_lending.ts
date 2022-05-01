import { GambleswapERC20__factory } from './../types/factories/GambleswapERC20__factory';
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;
import {GambleswapLPLending__factory} from "../types";

export async function removeLPFromLending() {
    const {lpAddress, lendingAddress, gmbAddress, pairAddress} = await getNamedAccounts()

    let lending = await GambleswapLPLending__factory.connect(lendingAddress, await getSigner(lpAddress))
    let gmb = await GambleswapERC20__factory.connect(gmbAddress, await getSigner(lpAddress))
    let pair = await GambleswapERC20__factory.connect(pairAddress, await getSigner(lpAddress))
    console.log(`before: lp: ${await pair.balanceOf(lpAddress)} gmb: ${await gmb.balanceOf(lpAddress)}`)
    await lending.exitLendingPool(1);
    console.log(`after: lp: ${await pair.balanceOf(lpAddress)} gmb: ${await gmb.balanceOf(lpAddress)}`)
    console.log("Exited from lending pool")
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })