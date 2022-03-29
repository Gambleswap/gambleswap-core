import {GambleswapPair, GambleswapPair__factory} from '../types'
import {GMBToken, GMBToken__factory} from '../types'
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner} = ethers;

export async function claimFromLP(_pairAddress=undefined, _lpAddress=undefined, _gmbAddress=undefined) {

    const {pairAddress, lpAddress, gmbAddress} = await getNamedAccounts();

    let pA = _pairAddress || pairAddress
    let lpA = _lpAddress || lpAddress
    let gmbA = _gmbAddress || gmbAddress

    console.log(lpAddress);
    console.log("==========================================================================================\n");

    const pair:GambleswapPair = GambleswapPair__factory.connect(pA, await getSigner(lpA));
    const gmb:GMBToken = GMBToken__factory.connect(gmbA, await getSigner(lpA));
    console.log(`before: ${await gmb.balanceOf(lpA)}`)
    await pair.claimGMB(lpA);
    console.log(`after: ${await gmb.balanceOf(lpA)}`)
}


// claimFromLP()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });