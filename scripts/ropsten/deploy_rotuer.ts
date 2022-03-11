import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

async function main() {

    const {factoryAddress, wethAddress, factoryOwnerAddress} = await getNamedAccounts();

    console.log("==========================================================================================\n");


    console.log("\n==========================================================================================");
    console.log(`start update land 1 & 2 appraisal in  Land Registration SC`);
    console.log("==========================================================================================\n");
    const routerFactory = await getContractFactory("contracts/UniswapV2Router02.sol:UniswapV2Router02");

    const router = await routerFactory.connect(await getSigner(factoryOwnerAddress)).deploy(factoryAddress, wethAddress);
    console.log("Deployed at " + router.address)
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });