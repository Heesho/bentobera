const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointZeroOne = convert("0.01", 18);
const pointZeroTwo = convert("0.02", 18);
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
      "BerachainRewardVaultFactory"
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

  it("Owners adds faction to multicall", async function () {
    console.log("******************************************************");
    await multicall.setFactions(
      [faction0.address, faction1.address, faction2.address],
      ["Faction 0", "Faction 1", "Faction 2"]
    );
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, faction0.address, [0], ["#06e647"], {
        value: pointZeroOne,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user1)
      .placeFor(
        user1.address,
        faction0.address,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
          "#e6cf06",
        ],
        {
          value: pointOne,
        }
      );
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
    await multicall
      .connect(user0)
      .placeFor(user0.address, faction0.address, [0], ["#33353a"], {
        value: pointZeroOne,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, faction0.address, [0], ["#56aa77"], {
        value: pointZeroOne,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, faction1.address, [0], ["#ffffff"], {
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

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(
        user0.address,
        faction2.address,
        [0, 1],
        ["#2e2c00", "#2e2c00"],
        {
          value: pointZeroTwo,
        }
      );
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await expect(
      multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction2.address,
          [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
          [
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
            "#0cff00",
          ],
          {
            value: pointZeroOne,
          }
        )
    ).to.be.reverted;
    await multicall
      .connect(user0)
      .placeFor(
        user0.address,
        faction2.address,
        [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        [
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
          "#ffc1c1",
        ],
        {
          value: pointOne,
        }
      );
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#700202"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          AddressZero,
          [getRndInteger(0, 100)],
          ["#374648"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#009b14"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 100)],
          ["#252524"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#dadbff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          AddressZero,
          [getRndInteger(0, 100)],
          ["#0004a2"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#00ff4e"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#880043"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          faction1.address,
          [getRndInteger(0, 100)],
          ["#010c06"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user1.address));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#888888"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#ffffff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction1.address,
          [getRndInteger(0, 100)],
          ["#000000"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#a500ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          user0.address,
          [getRndInteger(0, 100)],
          ["#1f1d20"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          user1.address,
          [getRndInteger(0, 100)],
          ["#ff6cb5"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          user0.address,
          [getRndInteger(0, 100)],
          ["#ff6300"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#4ba1b0"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#e17503"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          AddressZero,
          [getRndInteger(0, 100)],
          ["#919191"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          AddressZero,
          [getRndInteger(0, 100)],
          ["#f100ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          AddressZero,
          [getRndInteger(0, 100)],
          ["#202020"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#000000"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));

    it("User2 places tile", async function () {
      console.log("******************************************************");
      console.log("ETH balance: ", divDec(await user0.getBalance()));
      for (let i = 0; i < 100; i++) {
        await multicall
          .connect(user2)
          .placeFor(
            user2.address,
            faction1.address,
            [getRndInteger(0, 100)],
            ["#000000"],
            {
              value: pointZeroOne,
            }
          );
      }
      console.log("ETH balance: ", divDec(await user0.getBalance()));
    });
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#baffa2"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#a2e4ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#008374"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#260083"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#dd159e"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#01c96f"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#00ffef"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#060707"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction1.address,
          [getRndInteger(0, 100)],
          ["#000000"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#000000"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          user0.address,
          [getRndInteger(0, 100)],
          ["#000000"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          user1.address,
          [getRndInteger(0, 100)],
          ["#ffffff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          user2.address,
          [getRndInteger(0, 100)],
          ["#ffffff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("User0 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(
        user0.address,
        faction0.address,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
          "#325f27",
        ],
        {
          value: pointOne,
        }
      );
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user1)
      .placeFor(
        user1.address,
        faction0.address,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
          "#b3ffee",
        ],
        {
          value: pointOne,
        }
      );
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    await multicall
      .connect(user2)
      .placeFor(
        user2.address,
        faction2.address,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
          "#af3501",
        ],
        {
          value: pointOne,
        }
      );
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#3c2c26"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#0b0088"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 100)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 100)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 100)],
          ["#038dc5"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          user0.address,
          [getRndInteger(0, 100)],
          ["#c5033a"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          user1.address,
          [getRndInteger(0, 100)],
          ["#5f550f"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          user2.address,
          [getRndInteger(0, 100)],
          ["#5f550f"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
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

  it("Get Factions", async function () {
    console.log("******************************************************");
    console.log(await multicall.getFactions());
  });

  it("Get Account State", async function () {
    console.log("******************************************************");
    console.log(await multicall.getAccountState(user0.address));
  });

  it("Gauge data", async function () {
    console.log("******************************************************");
    console.log(await multicall.getGauge(user0.address));
  });

  it("Grid data Colors", async function () {
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

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 99); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 10; col++) {
        const pixelIndex = row * 10 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Increase Capacity", async function () {
    console.log("******************************************************");
    await expect(plugin.setCapacity(50)).to.be.revertedWith(
      "Plugin__InvalidCapacity()"
    );
    await plugin.setCapacity(200);
  });

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Grid data Colors", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          faction0.address,
          [getRndInteger(0, 200)],
          ["#064522"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User1 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          faction1.address,
          [getRndInteger(0, 200)],
          ["#b200ff"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User2 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          faction2.address,
          [getRndInteger(0, 200)],
          ["#0cbd00"],
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Grid data Factions", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.faction.toString());
      }
      console.log(rowColors.join(" "));
    }
  });

  it("Grid data Colors", async function () {
    console.log("******************************************************");
    const gridChunk = await multicall.getPixels(0, 199); // Fetch 100 pixels for a 10x10 grid
    // Visualize the grid
    console.log("Grid Visualization:");
    for (let row = 0; row < 10; row++) {
      let rowColors = [];
      for (let col = 0; col < 20; col++) {
        const pixelIndex = row * 20 + col;
        const pixel = gridChunk[pixelIndex];
        rowColors.push(pixel.color.toString());
      }
      console.log(rowColors.join(" "));
    }
  });
});
