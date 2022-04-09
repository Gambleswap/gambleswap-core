import { NetworksUserConfig } from 'hardhat/types';

require('dotenv').config({ path: require('find-config')('./.env') });

export const networks: NetworksUserConfig = {
    coverage: {
        url: 'http://127.0.0.1:8555',
        chainId: 1, // tbd
        blockGasLimit: 200000000,
        allowUnlimitedContractSize: true
    },
    // localhost: {
    //     chainId: 1337,
    //     url: 'http://127.0.0.1:8545',
    //     allowUnlimitedContractSize: true
    // },
    mainnet: {
        // chainId:3,
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: {
            mnemonic:process.env.MNEMONIC
        },
        allowUnlimitedContractSize: true
    },

    ropsten: {
        // chainId:3,
        url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: [`${process.env.FACTORY_OWNER_PRIVATE_KEY}`, `${process.env.LP_PRIVATE_KEY}`],
        allowUnlimitedContractSize: true
    },

    kovan: {
        chainId: 42,
        url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
        blockGasLimit: 200000000,
        accounts: {
            mnemonic:process.env.MNEMONIC
        }
    },

    rinkeby: {
        // chainId:
        url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
        blockGasLimit: 200000000,
        accounts: {
            mnemonic:process.env.MNEMONIC
        }
    }


}
