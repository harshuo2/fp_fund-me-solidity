require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const PRIVATE_KEY = process.env.METAMASK_KEY
const RPC_URL = process.env.INFURA_RINKEBY_RPC_URL
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
  //solidity: "0.6.0",
  solidity: {
    compilers: [{ version: "0.6.0" }, { version: "0.6.6" }], // using this we have not used several compilers of solidity
  },
  defaultNetwork: "hardhat",
  networks: {
    /*ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },*/
    rinkeby: {
      accounts: [PRIVATE_KEY],
      url: RPC_URL,
      chainId: 4,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337, // hardhat automatically takes care of the account part
    },
  },
  gasReporter: {
    enabled: true, // enable gas reporter
    currency: "USD", // prints the output in USD format
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt", // prints the output to this file
    noColors: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // this means this is the 1st account by default
      4: 0, // across different netowrks, it can be given diff values. like here, for rinkeby, it will be the 2nd account by default.
      // DON'T DO IT. BIGGEST MISTAKE OF MY LIFEEE!!!!
    },
  },
}
