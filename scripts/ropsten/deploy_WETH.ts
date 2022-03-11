import hre from "hardhat";
const { ethers, getChainId, waffle, getNamedAccounts} = hre;
const { getContractFactory } = ethers;

async function main() {


    const MyTokenFactory = await getContractFactory('contracts/UniToken.sol:UniToken');
    const weth = await MyTokenFactory.deploy('10000000000000000000000', '18', 'Wrapped ETH', 'WETH');

    console.log(`Token contract has been deployed at https://ropsten.etherscan.io/address/${weth.address}`);
    console.log("==========================================================================================");
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });