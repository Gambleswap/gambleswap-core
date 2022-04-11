import {deployFactory} from "./deploy_factory";
import {deployTestTokens} from "./deploy_testTokens";
import {deployGMB} from "./deploy_gmb";
import {deployRouter} from "./deploy_router";
import {addLP} from "./add_lp";
import {deployPair} from "./deploy_pair";
import {deployGambling} from "./deploy_gambling";
import {addAuthorisedPool} from "./add_authorised_pool";
import {claimFromLP} from "./claim_from_lp";
import {swap} from "./swap";
import {participate} from "./participate"
import {endGame} from "./end_game"
import {transferToUser} from "./transferToUser"
import hre from "hardhat";
const { getNamedAccounts} = hre;

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

    const {lpAddress, routerAddress, tokenAddress2, gmbAddress} = await getNamedAccounts();
    console.log(lpAddress)


    await deployFactory()
    await mineBlocks()
    await deployTestTokens()
    await mineBlocks()
    await deployGMB()
    await mineBlocks()
    await deployGambling()
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
    await mineBlocks()
    await addLP()
    await mineBlocks()
    await transferToUser()
    // await addLP(lpAddress, routerAddress, tokenAddress2, "0x63cf2cd54fe91e3545d1379abf5bfd194545259d")
    // await mineBlocks()
    await claimFromLP()
    await mineBlocks()
    await participate()
    await mineBlocks()
    // await endGame()
}


mainn()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
