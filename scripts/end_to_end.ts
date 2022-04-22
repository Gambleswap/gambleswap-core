import {deployFactory} from "./deploy_factory";
import {deployTestTokens} from "./deploy_testTokens";
import {deployGMB} from "./deploy_gmb";
import {deployRouter} from "./deploy_router";
import {addLP} from "./add_lp";
import {deployPair} from "./deploy_pair";
import {deployLending} from "./deploy_lending";
import {deployGambling} from "./deploy_gambling";
import {addAuthorisedPool} from "./add_authorised_pool";
import {claimFromLP} from "./claim_from_lp";
import {swap} from "./swap";
import {participate} from "./participate"
import {addLPToLending} from "./add_lp_to_lending"
import {endGame} from "./end_game"
import {transferToUser} from "./transferToUser"
import {lendAndParticipate} from "./lend_and_participate"
import hre from "hardhat";
const { getNamedAccounts} = hre;

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

export async function mainn() {


    await deployGMB()
    await mineBlocks(3)
    await deployGambling()
    await mineBlocks(3)
    await deployLending()
    await mineBlocks(3)
    await deployFactory()
    await mineBlocks(3)
    await deployTestTokens()
    await mineBlocks(3)
    await deployRouter()
    await mineBlocks(3)
    await deployPair()
    await mineBlocks(3)
    await addAuthorisedPool()
    await mineBlocks(3)
    await addLP()
    await mineBlocks(3)
    await swap()
    await mineBlocks(30)
    // await addLP()
    // await mineBlocks(3)
    // await transferToUser()
    // await addLP(lpAddress, routerAddress, tokenAddress2, "0x63cf2cd54fe91e3545d1379abf5bfd194545259d")
    // await mineBlocks(3)
    await claimFromLP()
    await mineBlocks(3)
    await addLPToLending()
    await participate()
    await lendAndParticipate()
    // await mineBlocks(3)
    await endGame()
}


mainn()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
