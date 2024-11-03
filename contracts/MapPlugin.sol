// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IGauge {
    function _deposit(address account, uint256 amount) external;

    function _withdraw(address account, uint256 amount) external;

    function balanceOf(address account) external view returns (uint256);

    function totalSupply() external view returns (uint256);
}

interface IBribe {
    function notifyRewardAmount(address token, uint amount) external;
}

interface IVoter {
    function OTOKEN() external view returns (address);
}

interface IBerachainRewardsVaultFactory {
    function createRewardsVault(address _vaultToken) external returns (address);
}

interface IRewardVault {
    function delegateStake(address account, uint256 amount) external;

    function delegateWithdraw(address account, uint256 amount) external;
}

contract VaultToken is ERC20, Ownable {
    constructor() ERC20("Bull Ish Vault Token", "BIVT") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

contract MapPlugin is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    uint256 public constant DURATION = 7 days;
    uint256 public constant AMOUNT = 1;
    uint256 public constant CAPACITY = 10000;

    string public constant PROTOCOL = "Gumball";
    string public constant NAME = "BentoBera";  

    /*----------  STATE VARIABLES  --------------------------------------*/

    IERC20 private immutable token;
    address private immutable OTOKEN;
    address private immutable voter;
    address private gauge;
    address private bribe;

    address private vaultToken;
    address private rewardVault;

    address[] private assetTokens;
    address[] private bribeTokens;

    address public treasury;
    uint256 public placePrice = 0.01 ether;
    uint256 public colorMax = 9;
    uint256 public factionMax;
    uint256 public totalPlaced;

    struct Pixel {
        address account;
        uint256 faction;
        uint256 color;
    }

    struct Faction {
        address owner;
        uint256 balance;
        uint256 totalPlaced;
    }

    // mapping(uint256 => Pixel) public index_Pixel;
    Pixel[CAPACITY] public index_Pixel;

    mapping(uint256 => Faction) public index_Faction;
    mapping(address => uint256) public factionOwner_Index;

    mapping(address => uint256) public account_Placed;

    mapping(address => mapping(uint256 => uint256)) public account_Faction_Balance;
    mapping(address => mapping(uint256 => uint256)) public account_Faction_Placed;

    /*----------  ERRORS ------------------------------------------------*/

    error Plugin__InvalidFaction();
    error Plugin__InvalidColor();
    error Plugin__InvalidIndex();
    error Plugin__InvalidZeroInput();
    error Plugin__NotAuthorizedVoter();

    /*----------  EVENTS ------------------------------------------------*/

    event Plugin__Placed(
        address indexed account,
        uint256 faction,
        uint256 color,
        uint256 index
    );
    event Plugin__ClaimedAnDistributed();
    event Plugin__TreasurySet(address treasury);
    event Plugin__PlacePriceSet(uint256 placePrice);
    event Plugin__ColorMaxSet(uint256 colorMax);

    /*----------  MODIFIERS  --------------------------------------------*/

    modifier onlyVoter() {
        if (msg.sender != voter) revert Plugin__NotAuthorizedVoter();
        _;
    }

    /*----------  FUNCTIONS  --------------------------------------------*/

    constructor(
        address _token, // WBERA
        address _voter,
        address[] memory _assetTokens, // [WBERA]
        address[] memory _bribeTokens, // [WBERA]
        address _treasury,
        address _vaultFactory
    ) {
        token = IERC20(_token);
        voter = _voter;
        assetTokens = _assetTokens;
        bribeTokens = _bribeTokens;
        treasury = _treasury;
        OTOKEN = IVoter(_voter).OTOKEN();

        vaultToken = address(new VaultToken());
        rewardVault = IBerachainRewardsVaultFactory(_vaultFactory).createRewardsVault(address(vaultToken));
    }

    function claimAndDistribute() external nonReentrant {
        uint256 balance = token.balanceOf(address(this));
        if (balance > DURATION) {
            uint256 treasuryFee = balance / 5;
            token.safeTransfer(treasury, treasuryFee);
            token.safeApprove(bribe, 0);
            token.safeApprove(bribe, balance - treasuryFee);
            IBribe(bribe).notifyRewardAmount(address(token), balance - treasuryFee);
        }
    }

    function placeFor(
        address account,
        uint256 faction,
        uint256 color,
        uint256[] calldata indexes
    ) external nonReentrant {
        if (faction >= factionMax) revert Plugin__InvalidFaction();
        if (color >= colorMax) revert Plugin__InvalidColor();
        if (indexes.length == 0) revert Plugin__InvalidZeroInput();

        for (uint256 i = 0; i < indexes.length; i++) {
            if (indexes[i] >= CAPACITY) revert Plugin__InvalidIndex();

            Pixel memory prevPixel = index_Pixel[indexes[i]];
            index_Pixel[indexes[i]] = Pixel(account, faction, color);

            if (prevPixel.account != address(0)) {

                index_Faction[prevPixel.faction].balance -= AMOUNT;
                account_Faction_Balance[prevPixel.account][prevPixel.faction] -= AMOUNT;

                IGauge(gauge)._withdraw(prevPixel.account, AMOUNT);
                IRewardVault(rewardVault).delegateWithdraw(prevPixel.account, AMOUNT);
                VaultToken(vaultToken).burn(address(this), AMOUNT);
            }
            emit Plugin__Placed(account, faction, color, indexes[i]);
        }

        uint256 amount = AMOUNT * indexes.length;
        uint256 cost = placePrice * indexes.length;
        uint256 fee = cost / 10;

        totalPlaced += amount;
        account_Placed[account] += amount;
        index_Faction[faction].balance += amount;
        account_Faction_Balance[account][faction] += amount;
        index_Faction[faction].totalPlaced += amount;
        account_Faction_Placed[account][faction] += amount;

        token.safeTransferFrom(msg.sender, index_Faction[faction].owner, fee);
        token.safeTransferFrom(msg.sender, address(this), cost - fee);

        IGauge(gauge)._deposit(account, amount);
        VaultToken(vaultToken).mint(address(this), amount);
        IERC20(vaultToken).safeApprove(rewardVault, 0);
        IERC20(vaultToken).safeApprove(rewardVault, amount);
        IRewardVault(rewardVault).delegateStake(account, amount);
    }

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function createFaction(address _owner) external onlyOwner {
        index_Faction[factionMax] = Faction(_owner, 0, 0);
        factionOwner_Index[_owner] = factionMax;
        factionMax++;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit Plugin__TreasurySet(treasury);
    }

    function setPlacePrice(uint256 _placePrice) external onlyOwner {
        placePrice = _placePrice;
        emit Plugin__PlacePriceSet(placePrice);
    }

    function setColorMax(uint256 _colorMax) external onlyOwner {
        colorMax = _colorMax;
        emit Plugin__ColorMaxSet(colorMax);
    }

    function setGauge(address _gauge) external onlyVoter {
        gauge = _gauge;
    }

    function setBribe(address _bribe) external onlyVoter {
        bribe = _bribe;
    }

    /*----------  VIEW FUNCTIONS  ---------------------------------------*/

    function balanceOf(address account) public view returns (uint256) {
        return IGauge(gauge).balanceOf(account);
    }

    function totalSupply() public view returns (uint256) {
        return IGauge(gauge).totalSupply();
    }

    function getToken() public view returns (address) {
        return address(token);
    }

    function getProtocol() public view virtual returns (string memory) {
        return PROTOCOL;
    }

    function getName() public view virtual returns (string memory) {
        return NAME;
    }

    function getVoter() public view returns (address) {
        return voter;
    }

    function getGauge() public view returns (address) {
        return gauge;
    }

    function getBribe() public view returns (address) {
        return bribe;
    }

    function getAssetTokens() public view returns (address[] memory) {
        return assetTokens;
    }

    function getBribeTokens() public view returns (address[] memory) {
        return bribeTokens;
    }

    function getVaultToken() public view returns (address) {
        return vaultToken;
    }

    function getRewardVault() public view returns (address) {
        return rewardVault;
    }

    function getPixel(uint256 index) public view returns (address account, uint256 faction, uint256 color) {
        Pixel memory pixel = index_Pixel[index];
        return (pixel.account, pixel.faction, pixel.color); 
    }

    function getPixels(uint256 startIndex, uint256 endIndex) public view returns (Pixel[] memory) {
        Pixel[] memory pixels = new Pixel[](endIndex - startIndex + 1);
        for (uint256 i = 0; i < pixels.length; i++) {
            pixels[i] = index_Pixel[startIndex + i];
        }
        return pixels;
    }
}
