const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhar-config")
const { verify } = require("../utils/verify")

module.exports = async function({getNamedAccounts, deployments}) {
  const {deploy, log} = deployments
  const {deployer} = await getNamedAccounts()

  log("--------------------------")
  const args = []

  const basicNft = await deploy("BasicNFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.waitConfirmations || 1
  })

  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    log("varifying..........")
    await verify(basicNft.address, args)
  }
  log("-------------------------------")
}


module.exports.tags = ["all", "basicnft", "main"]