const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic NFT unit test", function () {
      let deployer, basicNft;
      const chainId = network.config.chainId;

      beforeEach(async function () {
        //getNamedAccounts or ethers.getSigners() does basically the same
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNFT");
        // deployer = (await getNamedAccounts()).deployer
        // await deployments.fixture(["basicnft"])
        // basicNft = await ethers.getContract("BasicNFT", deployer)
      });

      describe("constructor", () => {
        it("initializes the NFT correctly", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(name, "Dog");
          assert.equal(symbol, "GOG");
          assert.equal(tokenCounter.toString(), "0");
        });
      });

      describe("mintNft", () => {
        beforeEach(async () => {
          const txResponse = await basicNft.mintNft();
          await txResponse.wait(1);
          // console.log(txResponse, "res");
        });

        it("allows users to mint NFT, and update appropriately", async () => {
          const tokenCounter = await basicNft.getTokenCounter();
          const tokenURI = await basicNft.tokenURI(0);

          assert.equal(tokenCounter.toString(), "1");
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });

        it("shows the correct balance and owner of NRT", async () => {
          const deployerAddress = deployer.address;
          const deployerBalance = await basicNft.balanceOf(deployerAddress);
          const owner = await basicNft.ownerOf("0");

          // console.log(deployer, "deployer");
          assert.equal(owner, deployerAddress);
          assert.equal(deployerBalance.toString(), "1");
        });
      });
    });
