// for normal deployments: #import #main function #main function call
// but for hardhat-deploy type deployment:
// by calling a function and then writing it
// async function deployMe() {
//   console.log("Hello ji!")
// }
const { deployContract } = require("ethereum-waffle")
const {
  networkConfig,
  DEVELOPMENT_CHAINS,
} = require("../helper-hardhat-config")
require("dotenv").config()
const { verify } = require("../utils/verify")

// module.exports.default = deployMe
//method 2:
module.exports = async ({ getNamedAccounts, deployments }) => {
  //another way of writing the async (hre) and   const { getNamedAccounts, deployments } = hre is written as above
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
  const RPC_URL = process.env.INFURA_RINKEBY_RPC_URL
  console.log("Are we starting?")
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() // iss naam ka kuch hai nahi. humein isse banana hai. it is declared from namedAccounts
  const chainId = network.config.chainId
  log(chainId)
  // when using hardhat or local networks, we use mocks to simulate the behavious of real objects (AggregatorV3Interface for example)
  // we need a way to modularise or parameterise this address in here so we don't have to change any code for deploying to any chain
  // eth / usd has diff values for different chains. even though the functionality might be the same, they are still different
  // to parameterise we need to do a little bit of refactoring (changing of the code to fir requirements)
  // we add the address of the chain in the constructor and refactor our code
  //const EthUsdPriceFeedAddress = networkConfig[chainId]["EthUsdPriceFeed"]
  // for deploying to any network be it local or some testnet, we can do so by running it using if else statement
  let EthUsdPriceFeedAddress
  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const EthUsdPriceFeedAggregator = await deployments.get("MockV3Aggregator")
    log(EthUsdPriceFeedAggregator)
    EthUsdPriceFeedAddress = EthUsdPriceFeedAggregator.address // here we have run the aggregator to get
    log("reading local network")
  } else {
    log("Are we in here")
    EthUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  const args = [EthUsdPriceFeedAddress]
  log(args)
  // what we have done here is run the script and checked which network is running using network.name command. this then helps us assign
  // value to ethusdpricefeed
  //for deploying using hardhat-deploy, we dont need to create the contractFactor. instead what we can do is...
  log(network.name)
  log(deployer)
  log(RPC_URL)
  const fundMe = await deploy("FundMe", {
    // we pass a bunch of parameters to custom deploy it
    from: deployer,
    args: args, // we input the price feed here as it is one of the constructor arguements
    log: true, // for custom logging
    waitConfirmations: network.config.blockConfirmations || 1,
  })
  if (!DEVELOPMENT_CHAINS.includes(network.name) && ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args)
  }
  log("----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
