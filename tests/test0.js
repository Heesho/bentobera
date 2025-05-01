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

let owner, treasury, user0, user1, user2, user3, owner0, owner1, owner2;
let base, voter, vaultFactory, factionFactory;
let plugin, multicall;
let faction0, faction1, faction2;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [owner, treasury, user0, user1, user2, user3, owner0, owner1, owner2] =
      await ethers.getSigners();

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

    const factionFactoryArtifact = await ethers.getContractFactory(
      "FactionFactory"
    );
    factionFactory = await factionFactoryArtifact.deploy();
    console.log("- Faction Factory Initialized");

    const pluginArtifact = await ethers.getContractFactory("MapPlugin");
    plugin = await pluginArtifact.deploy(
      base.address,
      voter.address,
      [base.address],
      [base.address],
      treasury.address,
      treasury.address,
      factionFactory.address,
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
      multicall.connect(user0).placeFor(user0.address, 0, [0], ["#5406e6"], {
        value: pointZeroOne,
      })
    ).to.be.revertedWith("Plugin__InvalidFaction");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tiles randomly", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await expect(
      multicall.connect(user0).placeFor(user0.address, 1, [0], ["#5406e6"], {
        value: pointZeroOne,
      })
    ).to.be.revertedWith("Plugin__InvalidFaction");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("Owners creates factions", async function () {
    console.log("******************************************************");
    await plugin.createFaction(owner0.address);
    faction0 = await ethers.getContractAt(
      "Faction",
      await plugin.index_Faction(1)
    );
    await plugin.createFaction(owner1.address);
    faction1 = await ethers.getContractAt(
      "Faction",
      await plugin.index_Faction(2)
    );
    await plugin.createFaction(owner2.address);
    faction2 = await ethers.getContractAt(
      "Faction",
      await plugin.index_Faction(3)
    );
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("Faction 0: ", await plugin.index_Faction(1));
    console.log("Faction 0 owner: ", await faction0.owner());
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, 1, [0], ["#06e647"], {
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
        1,
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
      .placeFor(user0.address, 1, [0], ["#33353a"], {
        value: pointZeroOne,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, 1, [0], ["#56aa77"], {
        value: pointZeroOne,
      });
    console.log("ETH balance: ", divDec(await user0.getBalance()));
  });

  it("User0 places tile", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user0.getBalance()));
    await multicall
      .connect(user0)
      .placeFor(user0.address, 2, [0], ["#ffffff"], {
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
      .placeFor(user0.address, 2, [0, 1], ["#2e2c00", "#2e2c00"], {
        value: pointZeroTwo,
      });
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
          2,
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
        1,
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
    const colors = new Array(1).fill("#700202");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#374648");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#009b14");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#252524");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#dadbff");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#0004a2");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#00ff4e");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#880043");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#010c06");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#888888");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#ffffff");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#000000");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#a500ff");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#1f1d20");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#ff6cb5");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#ff6300");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#4ba1b0");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#e17503");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#919191");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#f100ff");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#202020");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#000000");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
          {
            value: pointZeroOne,
          }
        );
    }
    console.log("ETH balance: ", divDec(await user0.getBalance()));

    it("User2 places tile", async function () {
      console.log("******************************************************");
      console.log("ETH balance: ", divDec(await user0.getBalance()));
      const colors = new Array(1).fill("#baffa2");
      for (let i = 0; i < 100; i++) {
        await multicall
          .connect(user2)
          .placeFor(
            user2.address,
            getRndInteger(1, 3),
            [getRndInteger(0, 100)],
            colors,
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
    const colors = new Array(1).fill("#baffa2");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#a2e4ff");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user2)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#008374");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user1.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#260083");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user2.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#dd159e");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#01c96f");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user0)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
    const colors = new Array(1).fill("#000000");
    for (let i = 0; i < 100; i++) {
      await multicall
        .connect(user1)
        .placeFor(
          user0.address,
          getRndInteger(1, 3),
          [getRndInteger(0, 100)],
          colors,
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
    const colors = new Array(10).fill("#325f27");
    await multicall
      .connect(user0)
      .placeFor(user0.address, 1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], colors, {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User1 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    const colors = new Array(10).fill("#b3ffee");
    await multicall
      .connect(user1)
      .placeFor(user1.address, 1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], colors, {
        value: pointOne,
      });
    console.log("ETH balance: ", divDec(await user1.getBalance()));
  });

  it("User2 places tiles in first row", async function () {
    console.log("******************************************************");
    console.log("ETH balance: ", divDec(await user1.getBalance()));
    const colors = new Array(10).fill("#af3501");
    await multicall
      .connect(user2)
      .placeFor(user2.address, 1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], colors, {
        value: pointOne,
      });
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
          getRndInteger(1, 3),
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
