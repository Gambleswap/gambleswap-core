import { Provider } from '@ethersproject/providers';
import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;
import { parseEther, formatEther} from "ethers/lib/utils";
const BigNumber = require('big-number');

export async function deployGMB(_lpAddress=undefined) {
    const {lpAddress} = await getNamedAccounts()
    let lpA = _lpAddress || lpAddress
    console.log("==========================================================================================");
    console.log(`GMB admin: ${lpA}`);
    console.log(`Start deploying contracts/GMB.sol:GMB`);
    console.log("==========================================================================================");

    const gmbFactory = await getContractFactory("contracts/GMB.sol:GMBToken");

    const gmb = await gmbFactory.connect(await getSigner(lpA)).deploy(40000000);

    console.log(`GMB has been deployed at ${gmb.address}`);
    return gmb.address
}


// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })