const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointZeroOne = convert("0.01", 18);
const pointOne = convert("0.1", 18);
const one = convert("1", 18);

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let owner, treasury, user0, user1, user2, user3, faction0, faction1, faction2;
let base, voter, vaultFactory;
let plugin, multicall;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [
      owner,
      treasury,
      user0,
      user1,
      user2,
      user3,
      faction0,
      faction1,
      faction2,
    ] = await ethers.getSigners();

    const baseArtifact = await ethers.getContractFactory("Base");
    base = await baseArtifact.deploy();
    console.log("- Base Initialized");

    const voterArtifact = await ethers.getContractFactory("Voter");
    voter = await voterArtifact.deploy();
    console.log("- Voter Initialized");

    const vaultFactoryArtifact = await ethers.getContractFactory(
      "BerachainRewardsVaultFactory"
    );
    vaultFactory = await vaultFactoryArtifact.deploy();
    console.log("- Vault Factory Initialized");

    const pluginArtifact = await ethers.getContractFactory("MapPlugin");
    plugin = await pluginArtifact.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address,
      vaultFactory.address
    );
    console.log("- Plugin Initialized");

    await voter.setPlugin(plugin.address);
    console.log("- System set up");

    const multicallArtifact = await ethers.getContractFactory("Multicall");
    multicall = await multicallArtifact.deploy(
      base.address,
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
    await expect(
      multicall.connect(user0).placeFor(user0.address, 0, 0, [0], {
        value: pointZeroOne,
      })
    ).to.be.revertedWith("Plugin__InvalidFaction");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Owners creates factions", async function () {
    console.log("******************************************************");
    await plugin.createFaction(faction0.address);
    await plugin.createFaction(faction1.address);
    await plugin.createFaction(faction2.address);
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 0, 0, [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user1)
      .placeFor(user1.address, 0, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const res = await multicall.getPixels(0, 1); // Fetch 100 pixels for a 10x10 grid
    console.log(res);
  });

  it("Grid data", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Get Pixels", async function () {
    console.log("******************************************************");
    console.log(await plugin.getPixel(0));
    console.log(await plugin.getPixel(1));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, 0, [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 1, 0, [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall.connect(user0).placeFor(user0.address, 2, 0, [0], {
      value: pointZeroOne,
    });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  /*


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

  */
});
