import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployFactory() {
    const {factoryOwnerAddress, gmbAddress, gamblingAddress, lendingAddress} = await getNamedAccounts()

    console.log("==========================================================================================");
    console.log(`Factory owner: ${factoryOwnerAddress}`);
    console.log(`Start deploying contracts/GambleswapFactory.sol:GambleswapFactory`);
    console.log("==========================================================================================");

    const factoryFactory = await getContractFactory("contracts/GambleswapFactory.sol:GambleswapFactory");

    const factory = await factoryFactory.connect(await getSigner(factoryOwnerAddress)).deploy(factoryOwnerAddress, gmbAddress, gamblingAddress, lendingAddress);


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