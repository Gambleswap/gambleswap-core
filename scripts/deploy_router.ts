import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployRouter(_factoryAddress=undefined) {

    const {factoryAddress, wethAddress, factoryOwnerAddress} = await getNamedAccounts();
    const fA = _factoryAddress || factoryAddress

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const routerFactory = await getContractFactory("contracts/GambleswapRouter.sol:GambleswapRouter");

    const router = await routerFactory.connect(await getSigner(factoryOwnerAddress)).deploy(fA, wethAddress);
    console.log("Deployed GambleswapRouter at " + router.address)
    return router.address
}


// deployRouter()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });