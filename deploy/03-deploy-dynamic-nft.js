const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

// const frownSvg = "./images/dynamicNft/frown.svg";
// const happySvg = "./images/dynamicNft/happy.svg";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;

  // if (!developmentChains.includes(network.name)) {
  //   const ethUsdAggregator = await ethers.getContract(
  //     "MockV3Aggregator",
  //     deployer
  //   );
  //   ethUsdPriceFeedAddress = ethUsdAggregator.address;
  // } else {
  //   ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  // }
  if (chainId == 31337) {
    // Find ETH/USD price feed
    const EthUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });

  const args = [ethUsdPriceFeedAddress, lowSVG, highSVG];

  log("-----------------------------");
  log("deploying dynamic nft");

  const dynamicNft = await deploy("DynamicSvgNft", {
    from: deployer,
    log: true,
    args,
    waitConfirmatons: network.config.blockConfirmatons || 1,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dynamicNft.address, args);
  }
};

module.exports.tags = ["all", "dynamicsvg", "main"];
