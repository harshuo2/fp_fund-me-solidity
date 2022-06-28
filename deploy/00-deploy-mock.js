// this is rarely used and is basically pre-computation stuff. Hence 00

const { network } = require("hardhat")
const {
  networkConfig,
  DECIMALS,
  INITIAL_ANSWER,
  DEVELOPMENT_CHAINS,
} = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const { chainId } = network.config.chainId
  log("is this okay?")
  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Local network detected! Deploying mocks")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      log: true,
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks Deployed!")
    log("--------------------------------------------")
  }
}

module.exports.tags = ["all", "mock"]
