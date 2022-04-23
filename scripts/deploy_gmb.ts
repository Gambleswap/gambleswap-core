import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployGMB() {
    const {factoryOwnerAddress} = await getNamedAccounts()

    console.log("==========================================================================================");
    console.log(`GMB admin: ${factoryOwnerAddress}`);
    console.log(`Start deploying contracts/GMB.sol:GMB`);
    console.log("==========================================================================================");

    const gmbFactory = await getContractFactory("contracts/GMB.sol:GMBToken");

    const gmb = await gmbFactory.connect(await getSigner(factoryOwnerAddress)).deploy(0);

    console.log(`GMB has been deployed at ${gmb.address}`);
    return gmb.address
}


// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     })