import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner, getContractFactory } = ethers;

export async function deployTestTokens(_lpAddress=undefined) {

    const {lpAddress} = await getNamedAccounts();
    let lpA = _lpAddress || lpAddress
    console.log(`Start deploying TestTokens`);
    console.log("==========================================================================================");


    const MyTokenFactory = await getContractFactory('contracts/TestToken.sol:TestToken');
    const rad = await MyTokenFactory.connect(await getSigner(lpA)).deploy('10000000000000000000000', '18', 'Token#1', 'RAD');
    const dni = await MyTokenFactory.connect(await getSigner(lpA)).deploy('10000000000000000000000', '18', 'Token#2', 'DNI');

    console.log(`Token contract has been deployed at https://ropsten.etherscan.io/address/${rad.address}`);
    console.log(`Token contract has been deployed at https://ropsten.etherscan.io/address/${dni.address}`);
    console.log("==========================================================================================");
    return [rad.address, dni.address]
}


// deployUniTokens()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });