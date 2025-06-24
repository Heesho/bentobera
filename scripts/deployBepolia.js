const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;

const VOTER_ADDRESS = "0x54cCcf999B5bd3Ea12c52810fA60BB0eB41d109c";
const WBERA_ADDRESS = "0x6969696969696969696969696969696969696969"; // WBERA address
const OBERO_ADDRESS = "0x935938EC3a925d09365e6Bd1f4eec04faF870b6e";
const VAULT_FACTORY_ADDRESS = "0x94Ad6Ac84f6C6FbA8b8CCbD71d9f4f101def52a8";

// Contract Variables
let plugin, multicall, WBERA;

// WBERA ABI
const WBERA_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
];

/*===================================================================*/
/*===========================  CONTRACT DATA  =======================*/

async function getContracts() {
  // Initialize provider
  provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  await provider.ready; // Ensure the provider is connected
  plugin = await ethers.getContractAt(
    "contracts/MapPlugin.sol:MapPlugin",
    "0x56C66F0ba4577182ED6217E1ac86B81C0BA47B35"
  );
  multicall = await ethers.getContractAt(
    "contracts/Multicall.sol:Multicall",
    "0x17BEE4c29E89ee61dA32Fdbc1851cADE60d4b360"
  );
  WBERA = new ethers.Contract(WBERA_ADDRESS, WBERA_ABI, provider);
  console.log("Contracts Retrieved");
}

/*===========================  END CONTRACT DATA  ===================*/
/*===================================================================*/

async function deployPlugin(wallet) {
  console.log("Starting Plugin Deployment");
  const pluginArtifact = await ethers.getContractFactory("MapPlugin");
  const pluginContract = await pluginArtifact.deploy(
    WBERA_ADDRESS,
    VOTER_ADDRESS,
    [WBERA_ADDRESS],
    [WBERA_ADDRESS],
    wallet.address,
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
  console.log("Plugin: ", plugin.address);
  console.log("Multicall: ", multicall.address);
  console.log("**************************************************************");
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

async function main() {
  const [wallet] = await ethers.getSigners();
  console.log("Using wallet: ", wallet.address);

  await getContracts();

  // await deployPlugin(wallet);
  // await deployMulticall();
  // await printDeployment();

  // await verifyPlugin(wallet);
  // await verifyMulticall();

  // await plugin.setPlacePrice(ethers.utils.parseEther("0.001"));

  // await multicall.placeFor(wallet.address, 1, "#4f0095", [6], {
  //   value: ethers.utils.parseEther("0.001"),
  //   gasPrice: ethers.gasPrice,
  // });

  // await sleep(10000);

  // await plugin.connect(wallet).setCapacity(10000);

  // console.log("Pixel 0: ", await plugin.getPixel(0));

  // console.log(
  //   "WBERA Balance: ",
  //   await WBERA.connect(wallet).balanceOf(wallet.address)
  // );

  // await WBERA.connect(wallet).withdraw(
  //   await WBERA.connect(wallet).balanceOf(wallet.address)

  await multicall.setFactions(
    [
      "0x039ec2E90454892fCbA461Ecf8878D0C45FDdFeE",
      "0x96f71F5ef424D560C9df490B453802C24D2Cd705",
      "0xe840113e95084f447465d265f62Ff062dA2aA903",
      "0x4D9c4736AF216a2c76e92886294A8D1C419FD22f",
      "0x9A2517f6B34EE33e41EF48BCfb25D75E8f8FFa0C",
      "0x081FCDD51f064DA905784955287Cfc95b051225A",
    ],
    [
      "Future Girls Inc",
      "Beradrome",
      "Sproto Gremlins",
      "The Bullas",
      "Yeet",
      "The Honey Cast",
    ]
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
