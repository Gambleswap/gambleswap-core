// import { GambleswapRouter__factory } from './../../types/factories/GambleswapRouter__factory';
// import { IERC20__factory } from './../../types/factories/IERC20__factory';
// import { GambleswapRouter } from './../../types/GambleswapRouter'
// import { IERC20 } from '../../types';
import {deployFactory} from "./deploy_factory";
import {deployUniTokens} from "./deploy_uniTokens";
import {deployGMB} from "./deploy_gmb";
import {deployRouter} from "./deploy_router";
import {addLP} from "./add_lp";
import {deployPair} from "./deploy_pair";
import {addAuthorisedPool} from "./add_authorised_pool";
import {claimFromLP} from "./claim_from_lp";
import {swap} from "./swap";
import hre from "hardhat";
const { ethers, getNamedAccounts} = hre;
const { getSigner } = ethers;

async function mineBlocks() {
    let blockNumber = 3;
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

async function mainn() {
    await deployFactory()
    await mineBlocks()
    await deployUniTokens()
    await mineBlocks()
    await deployGMB()
    await mineBlocks()
    await deployRouter()
    await mineBlocks()
    await deployPair()
    await mineBlocks()
    await addAuthorisedPool()
    await mineBlocks()
    await addLP()
    await mineBlocks()
    await swap()
    // await mineBlocks()
    // await claimFromLP()
    // await mineBlocks()
    // await addLP()
    // await mineBlocks()

    // const {lpAddress, routerAddress, tokenAddress1, tokenAddress2} = await getNamedAccounts();

    // console.log("==========================================================================================\n");

    // const router:GambleswapRouter = await GambleswapRouter__factory.connect(routerAddress, await getSigner(lpAddress))
    // const rad:IERC20 = await IERC20__factory.connect(tokenAddress1, await getSigner(lpAddress))
    // const dni:IERC20 = await IERC20__factory.connect(tokenAddress2, await getSigner(lpAddress))
    // await rad.approve(routerAddress, '9999999999999999999999')
    // await dni.approve(routerAddress, '9999999999999999999999')
    // await router.addLiquidity(tokenAddress1, tokenAddress2,
    //         '2000000000000000000', '2000000000000000000', 
    //         '2000000000000000000', '2000000000000000000', 
    //         lpAddress, 1746692432, {gasLimit: 2100000})
}


mainn()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });