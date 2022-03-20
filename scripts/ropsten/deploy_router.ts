import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployRouter() {

    const {factoryAddress, wethAddress, factoryOwnerAddress} = await getNamedAccounts();

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const routerFactory = await getContractFactory("contracts/GambleswapRouter.sol:GambleswapRouter");

    const router = await routerFactory.connect(await getSigner(factoryOwnerAddress)).deploy(factoryAddress, wethAddress);
    console.log("Deployed at " + router.address)
}


// deployRouter()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });