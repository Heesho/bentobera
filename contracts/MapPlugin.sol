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

interface IFactionFactory {
    function create(address plugin, address owner) external returns (address);
}

interface IFaction {
    function owner() external view returns (address);
    function _deposit(address account, uint256 amount) external;
    function _withdraw(address account, uint256 amount) external;
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

    uint256 public constant DURATION = 7 days;
    uint256 public constant AMOUNT = 1 ether;

    string public constant PROTOCOL = "Future Girls Inc";
    string public constant NAME = "BentoBera";  

    IERC20 private immutable token;
    address private immutable OTOKEN;
    address private immutable voter;
    address private immutable factionFactory;
    address private gauge;
    address private bribe;

    address private vaultToken;
    address private rewardVault;

    address[] private assetTokens;
    address[] private bribeTokens;

    address public treasury;
    address public developer;
    address public incentives;

    uint256 public capacity = 100;
    uint256 public placePrice = 0.01 ether;
    uint256 public factionMax;

    bool public activeBribes = true;
    bool public activeIncentives = false;

    struct Pixel {
        address account;
        address faction;
        string color;
    }

    mapping(uint256 => Pixel) public index_Pixel;
    mapping(uint256 => address) public index_Faction;
    mapping(address => uint256) public faction_Index;
    mapping(address => bool) public faction_Active;

    error Plugin__InvalidFaction();
    error Plugin__FactionInactive();
    error Plugin__InvalidColor();
    error Plugin__InvalidIndex();
    error Plugin__InvalidZeroInput();
    error Plugin__ArrayMismatch();
    error Plugin__NotAuthorizedVoter();
    error Plugin__InvalidCapacity();
    error Plugin__InvalidZeroAddress();
    error Plugin__NotAuthorizedDeveloper();

    event Plugin__Placed(
        address indexed account,
        address faction,
        uint256 index,
        string color
    );
    event Plugin__ClaimedAndDistributed(uint256 bribeAmount, uint256 incentivesAmount, uint256 developerAmount, uint256 treasuryAmount);
    event Plugin__PlacePriceSet(uint256 placePrice);
    event Plugin__CapacitySet(uint256 capacity);
    event Plugin__FactionCreated(uint256 factionIndex, address faction);
    event Plugin__FactionActiveSet(address faction, bool isActive);
    event Plugin__ActiveBribesSet(bool activeBribes);
    event Plugin__ActiveIncentivesSet(bool activeIncentives);
    event Plugin__TreasurySet(address treasury);
    event Plugin__DeveloperSet(address developer);
    event Plugin__IncentivesSet(address incentives);

    modifier onlyVoter() {
        if (msg.sender != voter) revert Plugin__NotAuthorizedVoter();
        _;
    }

    constructor(
        address _token, // WBERA
        address _voter,
        address[] memory _assetTokens, // [WBERA]
        address[] memory _bribeTokens, // [WBERA]
        address _treasury,
        address _developer,
        address _factionFactory,
        address _vaultFactory
    ) {
        token = IERC20(_token);
        voter = _voter;
        assetTokens = _assetTokens;
        bribeTokens = _bribeTokens;
        treasury = _treasury;
        developer = _developer;
        incentives = _treasury;
        factionFactory = _factionFactory;

        OTOKEN = IVoter(_voter).OTOKEN();
        vaultToken = address(new VaultToken());
        rewardVault = IBerachainRewardVaultFactory(_vaultFactory).createRewardVault(address(vaultToken));
    }

    function claimAndDistribute() external nonReentrant {
        uint256 balance = token.balanceOf(address(this));
        if (balance > DURATION) {
            uint256 bribeAmount = balance * 42 / 100;
            uint256 incentivesAmount = balance * 42 / 100;
            uint256 developerAmount = balance * 8 / 100;
            uint256 treasuryAmount = balance - bribeAmount - incentivesAmount - developerAmount;
            
            token.safeTransfer(developer, developerAmount);
            token.safeTransfer(treasury, treasuryAmount);

            uint256 totalIncentiveAmount = bribeAmount + incentivesAmount;
            if (activeBribes) {
                if (activeIncentives) {
                    token.safeTransfer(incentives, incentivesAmount);
                    token.safeApprove(bribe, 0);
                    token.safeApprove(bribe, bribeAmount);
                    IBribe(bribe).notifyRewardAmount(address(token), bribeAmount);
                    emit Plugin__ClaimedAndDistributed(bribeAmount, incentivesAmount, developerAmount, treasuryAmount);
                } else {
                    token.safeApprove(bribe, 0);
                    token.safeApprove(bribe, totalIncentiveAmount);
                    IBribe(bribe).notifyRewardAmount(address(token), totalIncentiveAmount);
                    emit Plugin__ClaimedAndDistributed(totalIncentiveAmount, 0, developerAmount, treasuryAmount);
                }
            } else {
                token.safeTransfer(incentives, totalIncentiveAmount);
                emit Plugin__ClaimedAndDistributed(0, totalIncentiveAmount, developerAmount, treasuryAmount);
            }
        }
    }

    function placeFor(
        address account,
        uint256 factionIndex,
        uint256[] calldata indexes,
        string[] calldata colors
    ) external nonReentrant {
        if (factionIndex == 0 || factionIndex > factionMax) revert Plugin__InvalidFaction();
        if (indexes.length == 0) revert Plugin__InvalidZeroInput();
        if (colors.length != indexes.length) revert Plugin__ArrayMismatch();
        address faction = index_Faction[factionIndex];
        if (!faction_Active[faction]) revert Plugin__FactionInactive();

        for (uint256 i = 0; i < indexes.length; i++) {
            if (indexes[i] >= capacity) revert Plugin__InvalidIndex();

            Pixel memory prevPixel = index_Pixel[indexes[i]];
            index_Pixel[indexes[i]] = Pixel(account, faction, colors[i]);

            if (prevPixel.account != address(0)) {
                IFaction(prevPixel.faction)._withdraw(prevPixel.account, AMOUNT);
                IGauge(gauge)._withdraw(prevPixel.account, AMOUNT);
                IRewardVault(rewardVault).delegateWithdraw(prevPixel.account, AMOUNT);
                VaultToken(vaultToken).burn(address(this), AMOUNT);
            }
            emit Plugin__Placed(account, faction, indexes[i], colors[i]);
        }

        uint256 amount = AMOUNT * indexes.length;
        uint256 cost = placePrice * indexes.length;
        uint256 fee = cost / 20;

        token.safeTransferFrom(msg.sender, IFaction(faction).owner(), fee);
        token.safeTransferFrom(msg.sender, address(this), cost - fee);

        IFaction(faction)._deposit(account, amount);
        IGauge(gauge)._deposit(account, amount);
        VaultToken(vaultToken).mint(address(this), amount);
        IERC20(vaultToken).safeApprove(rewardVault, 0);
        IERC20(vaultToken).safeApprove(rewardVault, amount);
        IRewardVault(rewardVault).delegateStake(account, amount);
    }

    function createFaction(address _owner) external onlyOwner {
        factionMax++;
        address faction = IFactionFactory(factionFactory).create(address(this), _owner);
        index_Faction[factionMax] = faction;
        faction_Index[faction] = factionMax;
        faction_Active[faction] = true;
        emit Plugin__FactionCreated(factionMax, faction);
    }

    function setFactionActive(address _faction, bool _isActive) external onlyOwner {
        faction_Active[_faction] = _isActive;
        emit Plugin__FactionActiveSet(_faction, _isActive);
    }

    function setActiveBribes(bool _activeBribes) external onlyOwner {
        activeBribes = _activeBribes;
        emit Plugin__ActiveBribesSet(activeBribes);
    }

    function setActiveIncentives(bool _activeIncentives) external onlyOwner {
        activeIncentives = _activeIncentives;
        emit Plugin__ActiveIncentivesSet(activeIncentives);
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
        if (_treasury == address(0)) revert Plugin__InvalidZeroAddress();
        treasury = _treasury;
        emit Plugin__TreasurySet(treasury);
    }

    function setDeveloper(address _developer) external {
        if (msg.sender != developer) revert Plugin__NotAuthorizedDeveloper();
        if (_developer == address(0)) revert Plugin__InvalidZeroAddress();
        developer = _developer;
        emit Plugin__DeveloperSet(developer);
    }

    function setIncentives(address _incentives) external onlyOwner {
        if (_incentives == address(0)) revert Plugin__InvalidZeroAddress();
        incentives = _incentives;
        emit Plugin__IncentivesSet(incentives);
    }

    function setGauge(address _gauge) external onlyVoter {
        gauge = _gauge;
    }

    function setBribe(address _bribe) external onlyVoter {
        bribe = _bribe;
    }

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

    function getFaction(uint256 index) public view returns (address faction, bool isActive) {
        faction = index_Faction[index];
        isActive = faction_Active[faction];
        return (faction, isActive);
    }

    function getPixel(uint256 index) public view returns (address account, address faction, string memory color) {
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
