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

interface IBerachainRewardVaultFactory {
    function createRewardVault(address _vaultToken) external returns (address);
}

interface IRewardVault {
    function delegateStake(address account, uint256 amount) external;
    function delegateWithdraw(address account, uint256 amount) external;
}

contract VaultToken is ERC20, Ownable {
    constructor() ERC20("BentoBera", "BentoBera") {}

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

    string public constant PROTOCOL = "Future Girls Inc";
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
    uint256 public capacity = 100;
    uint256 public placePrice = 0.01 ether;
    uint256 public factionMax;
    uint256 public totalPlaced;
    bool public autoBribe = true;

    struct Pixel {
        address account;
        uint256 faction;
        string color;
    }

    struct Faction {
        address owner;
        uint256 balance;
        uint256 placed;
        bool isActive;
    }

    mapping(uint256 => Pixel) public index_Pixel;

    mapping(uint256 => Faction) public index_Faction;
    mapping(address => uint256) public factionOwner_Index;

    mapping(address => uint256) public account_Placed;

    mapping(address => mapping(uint256 => uint256)) public account_Faction_Balance;
    mapping(address => mapping(uint256 => uint256)) public account_Faction_Placed;

    /*----------  ERRORS ------------------------------------------------*/

    error Plugin__InvalidFaction();
    error Plugin__FactionInactive();
    error Plugin__InvalidColor();
    error Plugin__InvalidIndex();
    error Plugin__InvalidZeroInput();
    error Plugin__NotAuthorizedVoter();
    error Plugin__InvalidCapacity();

    /*----------  EVENTS ------------------------------------------------*/

    event Plugin__Placed(
        address indexed account,
        uint256 faction,
        uint256 index,
        string color
    );
    event Plugin__ClaimedAndDistributed(uint256 amount);
    event Plugin__TreasurySet(address treasury);
    event Plugin__PlacePriceSet(uint256 placePrice);
    event Plugin__CapacitySet(uint256 capacity);
    event Plugin__FactionCreated(uint256 faction);
    event Plugin__FactionActiveSet(uint256 faction, bool isActive);
    event Plugin__AutoBribeSet(bool autoBribe);

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
        rewardVault = IBerachainRewardVaultFactory(_vaultFactory).createRewardVault(address(vaultToken));
    }

    function claimAndDistribute() external nonReentrant {
        uint256 balance = token.balanceOf(address(this));
        if (balance > DURATION) {
            uint256 treasuryFee = 0;
            if (treasury != address(0)) {
                treasuryFee = balance / 9;
                token.safeTransfer(treasury, treasuryFee);
            }
            if (autoBribe) {
                token.safeApprove(bribe, 0);
                token.safeApprove(bribe, balance - treasuryFee);
                IBribe(bribe).notifyRewardAmount(address(token), balance - treasuryFee);
            } else {
                token.safeTransfer(treasury, balance - treasuryFee);
            }
            emit Plugin__ClaimedAndDistributed(balance);
        }
    }

    function placeFor(
        address account,
        uint256 faction,
        string calldata color,
        uint256[] calldata indexes
    ) external nonReentrant {
        if (faction == 0 || faction > factionMax) revert Plugin__InvalidFaction();
        if (!index_Faction[faction].isActive) revert Plugin__FactionInactive();
        if (indexes.length == 0) revert Plugin__InvalidZeroInput();
        if (!validateColorFormat(color)) revert Plugin__InvalidColor();

        for (uint256 i = 0; i < indexes.length; i++) {
            if (indexes[i] >= capacity) revert Plugin__InvalidIndex();

            Pixel memory prevPixel = index_Pixel[indexes[i]];
            index_Pixel[indexes[i]] = Pixel(account, faction, color);

            if (prevPixel.account != address(0)) {

                index_Faction[prevPixel.faction].balance -= AMOUNT;
                account_Faction_Balance[prevPixel.account][prevPixel.faction] -= AMOUNT;

                IGauge(gauge)._withdraw(prevPixel.account, AMOUNT);
                IRewardVault(rewardVault).delegateWithdraw(prevPixel.account, AMOUNT);
                VaultToken(vaultToken).burn(address(this), AMOUNT);
            }
            emit Plugin__Placed(account, faction, indexes[i], color);
        }

        uint256 amount = AMOUNT * indexes.length;
        uint256 cost = placePrice * indexes.length;
        uint256 fee = cost / 10;

        totalPlaced += amount;
        account_Placed[account] += amount;
        index_Faction[faction].balance += amount;
        account_Faction_Balance[account][faction] += amount;
        index_Faction[faction].placed += amount;
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
        factionMax++;
        index_Faction[factionMax] = Faction(_owner, 0, 0, true);
        factionOwner_Index[_owner] = factionMax;
        emit Plugin__FactionCreated(factionMax);
    }

    function setFactionActive(uint256 _faction, bool _isActive) external onlyOwner {
        index_Faction[_faction].isActive = _isActive;
        emit Plugin__FactionActiveSet(_faction, _isActive);
    }

    function setAutoBribe(bool _autoBribe) external onlyOwner {
        autoBribe = _autoBribe;
        emit Plugin__AutoBribeSet(autoBribe);
    }

    function setPlacePrice(uint256 _placePrice) external onlyOwner {
        placePrice = _placePrice;
        emit Plugin__PlacePriceSet(placePrice);
    }

    function setCapacity(uint256 _capacity) external onlyOwner {
        if (_capacity <= capacity) revert Plugin__InvalidCapacity();
        capacity = _capacity;
        emit Plugin__CapacitySet(capacity);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit Plugin__TreasurySet(treasury);
    }

    function setGauge(address _gauge) external onlyVoter {
        gauge = _gauge;
    }

    function setBribe(address _bribe) external onlyVoter {
        bribe = _bribe;
    }

    function validateColorFormat(string memory color) internal pure returns (bool) {
        bytes memory colorBytes = bytes(color);
        if (colorBytes.length != 7) return false; // "#RRGGBB" format
        if (colorBytes[0] != '#') return false;
        
        for (uint i = 1; i < 7; i++) {
            bytes1 char = colorBytes[i];
            bool isHexDigit = (
                (char >= '0' && char <= '9') ||
                (char >= 'a' && char <= 'f') ||
                (char >= 'A' && char <= 'F')
            );
            if (!isHexDigit) return false;
        }
        return true;
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

    function getFaction(uint256 _faction) public view returns (address owner, uint256 balance, uint256 placed, bool isActive) {
        return (index_Faction[_faction].owner, index_Faction[_faction].balance, index_Faction[_faction].placed, index_Faction[_faction].isActive);
    }

    function getPixel(uint256 index) public view returns (address account, uint256 faction, string memory color) {
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
