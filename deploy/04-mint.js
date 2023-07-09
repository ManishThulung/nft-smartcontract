const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  // basic
  const basicNft = await ethers.getContract("BasicNFT", deployer);
  const basicNftMintTx = await basicNft.mintNft();
  await basicNftMintTx.wait(1);
  console.log(`basicNft index 0 has tokenUri: ${await basicNft.tokenURI(0)}`);

  //dynamic
  const highValue = ethers.utils.parseEther("4000");
  const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicNftMintTx = await dynamicNft.mintNft(highValue);
  await dynamicNftMintTx.wait(1);
  console.log(
    `dynamic svg nft index 0 tokenUri: ${await dynamicNft.tokenURI(0)}`
  );

  // random
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();
  const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
    value: mintFee.toString(),
  });
  const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);

  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000); // 5 minute timeout time
    randomIpfsNft.once("NftMinted", async () => {
      resolve();
    });

    if (developmentChains.includes(network.name)) {
      const requestId =
        randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });

  console.log(
    `Random ipfs nft index 0 tokenUri: ${await randomIpfsNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
