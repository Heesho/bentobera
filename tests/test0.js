const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointZeroOne = convert("0.01", 18);
const one = convert("1", 18);

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

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

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 100)],
          [getRndInteger(0, 100)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 200; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    for (let i = 0; i < 200; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user2.getBalance()));
    for (let i = 0; i < 200; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user2.getBalance()));
  });

  it("User3 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user3.getBalance()));
    for (let i = 0; i < 200; i++) {
      await multicall
        .connect(user3)
        .placeFor(
          user3.address,
          [getRndInteger(0, 25)],
          [getRndInteger(0, 25)],
          getRndInteger(0, 9),
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user3.getBalance()));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getGridChunk(0, 0, 24, 24);
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let i = 0; i < gridChunk.length; i++) {
      let row = gridChunk[i].map((item) => item[0].toString()).join(" "); // Only take the color number
      console.log(row);
    }
  });
});
