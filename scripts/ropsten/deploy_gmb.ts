import { Provider } from '@ethersproject/providers';
import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;
import { parseEther, formatEther} from "ethers/lib/utils";
const BigNumber = require('big-number');

export async function deployGMB() {
    const {lpAddress} = await getNamedAccounts()

    console.log("==========================================================================================");
    console.log(`GMB admin: ${lpAddress}`);
    console.log(`Start deploying contracts/GMB.sol:GMB`);
    console.log("==========================================================================================");

    const gmbFactory = await getContractFactory("contracts/GMB.sol:GMBToken");

    const gmb = await gmbFactory.connect(await getSigner(lpAddress)).deploy(400000);

    console.log(`GMB has been deployed at ${gmb.address}`);
}


// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })