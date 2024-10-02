const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;

// Contract Variables
let base, plugin, multicall, voter;

/*===================================================================*/
/*===========================  CONTRACT DATA  =======================*/

async function getContracts() {
  base = await ethers.getContractAt(
    "contracts/Base.sol:Base",
    "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8" // WBERA
  );
  voter = await ethers.getContractAt(
    "contracts/Voter.sol:Voter",
    "0xd91AAEC4D0A111a219468323eB0887F38637fA9F"
  );
  plugin = await ethers.getContractAt(
    "contracts/BentoPlugin.sol:BentoPlugin",
    "0x07A62b4D2A20Cb1e6A4e194FD43e81BdbaC2c52b"
  );
  multicall = await ethers.getContractAt(
    "contracts/Multicall.sol:Multicall",
    "0x74288bbe4872c9afB105A377A6bC13891E6A6adc"
  );
  console.log("Contracts Retrieved");
}

/*===========================  END CONTRACT DATA  ===================*/
/*===================================================================*/

async function deployBase() {
  console.log("Starting Base Deployment");
  const baseArtifact = await ethers.getContractFactory("Base");
  const baseContract = await baseArtifact.deploy();
  base = await baseContract.deployed();
  console.log("Base Deployed at:", base.address);
}

async function deployVoter() {
  console.log("Starting Voter Deployment");
  const voterArtifact = await ethers.getContractFactory("Voter");
  const voterContract = await voterArtifact.deploy();
  voter = await voterContract.deployed();
  console.log("Voter Deployed at:", voter.address);
}

async function deployPlugin(wallet) {
  console.log("Starting Plugin Deployment");
  const pluginArtifact = await ethers.getContractFactory("BentoPlugin");
  const pluginContract = await pluginArtifact.deploy(
    base.address,
    voter.address,
    [base.address],
    [base.address],
    wallet.address,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  plugin = await pluginContract.deployed();
  await sleep(5000);
  console.log("Plugin Deployed at:", plugin.address);
}

async function deployMulticall() {
  console.log("Starting Multicall Deployment");
  const multicallArtifact = await ethers.getContractFactory("Multicall");
  const multicallContract = await multicallArtifact.deploy(
    plugin.address,
    voter.address,
    await voter.OTOKEN(),
    {
      gasPrice: ethers.gasPrice,
    }
  );
  multicall = await multicallContract.deployed();
  console.log("Multicall Deployed at:", multicall.address);
}

async function printDeployment() {
  console.log("**************************************************************");
  console.log("Base: ", base.address);
  console.log("Voter: ", voter.address);
  console.log("Plugin: ", plugin.address);
  console.log("Multicall: ", multicall.address);
  console.log("**************************************************************");
}

async function verifyBase() {
  await hre.run("verify:verify", {
    address: base.address,
    constructorArguments: [],
  });
}

async function verifyVoter() {
  await hre.run("verify:verify", {
    address: voter.address,
    constructorArguments: [],
  });
}

async function verifyPlugin(wallet) {
  await hre.run("verify:verify", {
    address: plugin.address,
    constructorArguments: [
      base.address,
      voter.address,
      [base.address],
      [base.address],
      wallet.address,
    ],
  });
}

async function verifyMulticall() {
  await hre.run("verify:verify", {
    address: multicall.address,
    constructorArguments: [plugin.address, voter.address, await voter.OTOKEN()],
  });
}

async function setUpSystem() {
  console.log("Starting System Set Up");
  await voter.setPlugin(plugin.address);
  console.log("System Initialized");
}

async function main() {
  const [wallet] = await ethers.getSigners();
  console.log("Using wallet: ", wallet.address);

  await getContracts();

  // await deployBase();
  // await deployVoter();
  // await deployPlugin(wallet);
  // await deployMulticall();
  // await printDeployment();

  // await verifyBase();
  // await verifyVoter();
  // await verifyPlugin(wallet);
  // await verifyMulticall();

  // await setUpSystem();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
