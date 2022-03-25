import hre from "hardhat";
import { GMBToken__factory } from './../../types/factories/GMBToken__factory';
import { GMBToken } from './../../types/GMBToken'
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;
const BigNumber = require('big-number');

export async function addAuthorisedPool(_pairAddress=undefined) {
    const {pairAddress, gmbAddress, lpAddress} = await getNamedAccounts()

    const pA = _pairAddress || pairAddress

    const gmb:GMBToken = GMBToken__factory.connect(gmbAddress, await getSigner(lpAddress));

    await gmb.addNewPool(pairAddress);
    console.log(`pool is authorised ${pairAddress}`)
}


// addAuthorisedPool()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })