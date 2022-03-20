import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployUniTokens() {

    const {lpAddress} = await getNamedAccounts();

    console.log(`Start deploying UniTokens`);
    console.log("==========================================================================================");


    const MyTokenFactory = await getContractFactory('contracts/UniToken.sol:UniToken');
    const rad = await MyTokenFactory.connect(await getSigner(lpAddress)).deploy('10000000000000000000000', '18', 'Token#1', 'RAD');
    const dni = await MyTokenFactory.connect(await getSigner(lpAddress)).deploy('10000000000000000000000', '18', 'Token#2', 'DNI');

    console.log(`Token contract has been deployed at https://ropsten.etherscan.io/address/${rad.address}`);
    console.log(`Token contract has been deployed at https://ropsten.etherscan.io/address/${dni.address}`);
    console.log("==========================================================================================");
}


// deployUniTokens()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });