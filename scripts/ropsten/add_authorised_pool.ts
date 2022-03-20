import hre from "hardhat";
import { GMBToken__factory } from './../../types/factories/GMBToken__factory';
import { GMBToken } from './../../types/GMBToken'
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;
const BigNumber = require('big-number');

async function main() {
    const {pairAddress, gmbAddress, lpAddress} = await getNamedAccounts()

    const gmb:GMBToken = GMBToken__factory.connect(gmbAddress, await getSigner(lpAddress));

    await gmb.addNewPool(pairAddress);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    })