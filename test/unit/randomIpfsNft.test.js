const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft unit test", () => {
      let deployer, randomIpfsNft, vrfCoordinatorV2Mock, mintFee;
      const chainId = network.config.chainId;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        // deployes all the scripts that contains tags 'all'
        await deployments.fixture(["all"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        mintFee = networkConfig[chainId]["mintFee"];
      });

      describe("constructor", () => {
        it("initializes constructor correctly", async () => {
          const dogTokenUri = await randomIpfsNft.getDogTokenUris(0);
          const isInitialized = await randomIpfsNft.getInitialized();
          assert(dogTokenUri.includes("ipfs://"));
          assert(isInitialized, true);
        });
      });

      describe("requestNft", () => {
        it("fails if payment is not sent with the request", async () => {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });

        it("reverts if the payment is less than the mint fee", async () => {
          const fee = await randomIpfsNft.getMintFee();
          // console.log(fee.toString(), "fee");
          // console.log(mintFee, "mintfee");
          // assert.equal(mintFee, fee.toString());

          await expect(
            randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.001")),
            })
          ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
        });

        it("emits an event and kicks of the random request", async () => {
          const fee = await randomIpfsNft.getMintFee();
          console.log(fee);
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
          console.log("end");
        });
      });
    });
