import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import '@typechain/hardhat'
import "hardhat-deploy";
import {networks} from "./hardhat.networks";
const WORDLIST_OWNER = process.env.WORDLIST_OWNER;
const FACTORY_OWNER_ADDRESS = process.env.FACTORY_OWNER_ADDRESS;
const DICTIONARY_OWNER = process.env.DICTIONARY_OWNER;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const PAIR_ADDRESS = process.env.PAIR_ADDRESS
const WETH_ADDRESS = process.env.WETH_ADDRESS
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS
const LP_ADDRESS = process.env.LP_ADDRESS
const TOKEN_ADDRESS_1 = process.env.TOKEN_ADDRESS_1
const TOKEN_ADDRESS_2 = process.env.TOKEN_ADDRESS_2
const GMB_ADDRESS = process.env.GMB_ADDRESS
const GAMBLING_ADDRESS = process.env.GAMBLING_ADDRESS
const USER_ADDRESS = process.env.USER_ADDRESS
const config =  {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  networks,
  namedAccounts: {
    // deployer: {  // check on chainid https://chainid.network/
    //   default: 0,  // first account as deployer
    //   1: 0, // Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    // },

    wordListOwner: {
      default: WORDLIST_OWNER,
    },
    factoryOwnerAddress: {
      default: FACTORY_OWNER_ADDRESS,
    },
    lpAddress: {
      default: LP_ADDRESS,
    },
    user: {
      default: USER_ADDRESS,
    },
    dictionaryOwner: {
      default: DICTIONARY_OWNER,
    },
    factoryAddress: {
      default: FACTORY_ADDRESS,
    },
    wethAddress: {
      default: WETH_ADDRESS,
    },
    pairAddress: {
      default: PAIR_ADDRESS,
    },
    routerAddress: {
      default: ROUTER_ADDRESS
    },
    tokenAddress1: {
      default: TOKEN_ADDRESS_1
    },
    tokenAddress2: {
      default: TOKEN_ADDRESS_2
    },
    gmbAddress: {
      default: GMB_ADDRESS
    },
    gamblingAddress: {
      default: GAMBLING_ADDRESS
    },
    userAddress: {
      default: USER_ADDRESS
    }
  },
};

module.exports = config;
