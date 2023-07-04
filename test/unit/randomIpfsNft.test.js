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
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
        });
      });

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async () => {
          await new Promise(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await randomIpfsNft.tokenURI("0");
                const tokenCounter = await randomIpfsNft.getTokenCounter();

                assert.equal(tokenCounter.toString(), "0");
                assert(tokenUri.includes("ipfs://"));
                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });

            try {
              const fee = await randomIpfsNft.getMintFee();
              const tx = await randomIpfsNft.requestNft({
                value: fee.toString(),
              });
              // console.log(tx, "tx");
              const txReceipt = await tx.wait(1);
              // console.log(txReceipt, "receit");
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                txReceipt.events[1].args.requestId,
                randomIpfsNft.address
              );
            } catch (error) {
              console.log(error);
            }
          });
        });
      });

      describe("getBreedModdedRng", () => {
        it("should return pug if random number is < 10", async () => {
          const value = await randomIpfsNft.getBreedModdedRng(9);
          assert.equal(0, value);
        });
        it("should return st bernard if random number is between 10 - 40", async () => {
          const value = await randomIpfsNft.getBreedModdedRng(38);
          assert.equal(1, value);
        });
        it("should return pug if random number between 40 - 99", async () => {
          const value = await randomIpfsNft.getBreedModdedRng(98);
          assert.equal(2, value);
        });
        it("should revert if random number > 99", async () => {
          await expect(randomIpfsNft.getBreedModdedRng(101)).to.be.revertedWith(
            "RandomIpfsNft__RangeOutOfBound"
          );
        });
      });
    });
