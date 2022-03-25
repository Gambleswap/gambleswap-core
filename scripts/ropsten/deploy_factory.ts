import { Provider } from '@ethersproject/providers';
import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;
import { parseEther, formatEther} from "ethers/lib/utils";
const BigNumber = require('big-number');

export async function deployFactory() {
    const {factoryOwnerAddress, gmbAddress} = await getNamedAccounts()

    console.log("==========================================================================================");
    console.log(`Factory owner: ${factoryOwnerAddress}`);
    console.log(`Start deploying contracts/GambleswapFactory.sol:GambleswapFactory`);
    console.log("==========================================================================================");

    const factoryFactory = await getContractFactory("contracts/GambleswapFactory.sol:GambleswapFactory");

    const factory = await factoryFactory.connect(await getSigner(factoryOwnerAddress)).deploy(factoryOwnerAddress, gmbAddress);


    console.log(`Factory has been deployed at ${factory.address}`);
    return factory.address;
}

// exports deployFactory

// deployFactory()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })