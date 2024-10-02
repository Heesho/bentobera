const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointOne = convert("0.1", 18);
const one = convert("1", 18);

let owner, treasury, user0, user1, user2, user3;
let base, voter;
let plugin, multicall;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [owner, treasury, user0, user1, user2, user3] = await ethers.getSigners();

    const baseArtifact = await ethers.getContractFactory("Base");
    base = await baseArtifact.deploy();
    console.log("- Base Initialized");

    const voterArtifact = await ethers.getContractFactory("Voter");
    voter = await voterArtifact.deploy();
    console.log("- Voter Initialized");

    const pluginArtifact = await ethers.getContractFactory("BentoPlugin");
    plugin = await pluginArtifact.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address
    );
    console.log("- Plugin Initialized");

    await voter.setPlugin(plugin.address);
    console.log("- System set up");

    const multicallArtifact = await ethers.getContractFactory("Multicall");
    multicall = await multicallArtifact.deploy(
      plugin.address,
      voter.address,
      await voter.OTOKEN()
    );
    console.log("- Multicall Initialized");

    console.log("Initialization Complete");
    console.log();
  });

  it("First test", async function () {
    console.log("******************************************************");
  });
  /*
  it("User0 tries to copy pasta that doesnt exist", async function () {
    console.log("******************************************************");
    await expect(
      plugin.connect(user0).copy(user0.address, { value: pointOne })
    ).to.be.revertedWith("Plugin__InvalidPasta");
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user2)
      .create(user2.address, "Henlo World from user2", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("Forward time 2000 seconds", async function () {
    console.log("******************************************************");
    await network.provider.send("evm_increaseTime", [2000]);
    await network.provider.send("evm_mine");
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("Forward 1 hour", async function () {
    console.log("******************************************************");
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("get queue", async function () {
    console.log("******************************************************");
    const queue = await multicall.getQueue();
    console.log("Queue: ", queue);
  });

  it("get queue sizes", async function () {
    console.log("******************************************************");
    console.log("Queue Size: ", await plugin.getQueueSize());
    console.log("Creator Queue Size: ", await plugin.getCreatorQueueSize());
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user2)
      .create(user2.address, "Henlo World from user2", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user2)
      .create(user2.address, "Henlo World from user2", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User1 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user1).copy(user1.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("User2 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user2).copy(user2.address, { value: pointOne });
  });

  it("Forward 1 hour", async function () {
    console.log("******************************************************");
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User3 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user3)
      .create(user3.address, "Henlo World from user3", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("Forward 1 hour", async function () {
    console.log("******************************************************");
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await plugin
      .connect(user0)
      .create(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await plugin.connect(user0).copy(user0.address, { value: pointOne });
  });

  it("get queue sizes", async function () {
    console.log("******************************************************");
    console.log("Queue Size: ", await plugin.getQueueSize());
    console.log("Creator Queue Size: ", await plugin.getCreatorQueueSize());
  });

  it("multicall testing", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
    await voter.getReward(user0.address);
    console.log(await multicall.getGauge(user0.address));
  });

  it("User0 copies pasta", async function () {
    console.log("******************************************************");
    await multicall
      .connect(user0)
      .copyPasta(user0.address, { value: pointOne });
  });

  it("User0 creates new pasta", async function () {
    console.log("******************************************************");
    let price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
    await multicall
      .connect(user0)
      .createPasta(user0.address, "Henlo World from user0", 1827464427, price, {
        value: price,
      });
    console.log("Pasta created");
    price = await plugin.getCreatePrice();
    console.log("Price: ", divDec(price));
  });

  */
});
