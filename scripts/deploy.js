const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;

const VOTER_ADDRESS = "0x1f9505Ae18755915DcD2a95f38c7560Cab149d9C";
const WBERA_ADDRESS = "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8"; // WBERA address
const OBERO_ADDRESS = "0x7629668774f918c00Eb4b03AdF5C4e2E53d45f0b";
const VAULT_FACTORY_ADDRESS = "0x2B6e40f65D82A0cB98795bC7587a71bfa49fBB2B";

// Contract Variables
let base, plugin, multicall, voter;

/*===================================================================*/
/*===========================  CONTRACT DATA  =======================*/

async function getContracts() {
  // base = await ethers.getContractAt(
  //   "contracts/Base.sol:Base",
  //   "" // WBERA
  // );
  // voter = await ethers.getContractAt("contracts/Voter.sol:Voter", "");
  plugin = await ethers.getContractAt(
    "contracts/MapPlugin.sol:MapPlugin",
    "0x7fCEDb15d7a2C55894Ab4C07CD4E933fDe7E36f5"
  );
  multicall = await ethers.getContractAt(
    "contracts/Multicall.sol:Multicall",
    "0x5B868FCdCF8711253f509d2B69A494F358bf5d54"
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
  const pluginArtifact = await ethers.getContractFactory("MapPlugin");
  const pluginContract = await pluginArtifact.deploy(
    WBERA_ADDRESS,
    VOTER_ADDRESS,
    [WBERA_ADDRESS],
    [WBERA_ADDRESS],
    wallet.address,
    VAULT_FACTORY_ADDRESS,
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
    WBERA_ADDRESS,
    plugin.address,
    VOTER_ADDRESS,
    OBERO_ADDRESS,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  multicall = await multicallContract.deployed();
  console.log("Multicall Deployed at:", multicall.address);
}

async function printDeployment() {
  console.log("**************************************************************");
  // console.log("Base: ", base.address);
  // console.log("Voter: ", voter.address);
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
      WBERA_ADDRESS,
      VOTER_ADDRESS,
      [WBERA_ADDRESS],
      [WBERA_ADDRESS],
      wallet.address,
      VAULT_FACTORY_ADDRESS,
    ],
  });
}

async function verifyMulticall() {
  await hre.run("verify:verify", {
    address: multicall.address,
    constructorArguments: [
      WBERA_ADDRESS,
      plugin.address,
      VOTER_ADDRESS,
      OBERO_ADDRESS,
    ],
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
