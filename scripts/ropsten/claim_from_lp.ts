import {GambleswapPair, GambleswapPair__factory} from '../../types'
import {GMBToken, GMBToken__factory} from '../../types'
import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getSigner} = ethers;

async function main() {

    const {pairAddress, lpAddress, gmbAddress} = await getNamedAccounts();

    console.log(lpAddress);
    console.log("==========================================================================================\n");

    const pair:GambleswapPair = GambleswapPair__factory.connect(pairAddress, await getSigner(lpAddress));
    const gmb:GMBToken = GMBToken__factory.connect(gmbAddress, await getSigner(lpAddress));
    console.log(`before: ${await gmb.balanceOf(lpAddress)}`)
    let tx = await pair.claim();
    let receipt = await tx.wait();

//   const event = rc.events.find(event => event.event === 'Transfer');
    console.log(receipt);
    console.log(`after: ${await gmb.balanceOf(lpAddress)}`)
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });