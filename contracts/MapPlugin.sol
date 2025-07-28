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
    function notifyRewardAmount(address token, uint256 amount) external;
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

    uint256 public constant DURATION = 7 days;
    uint256 public constant AMOUNT = 1 ether;

    string public constant PROTOCOL = "Future Girls Inc";
    string public constant NAME = "BentoBera";

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
    address public developer;
    address public incentives;

    uint256 public capacity = 100;
    uint256 public price = 0.01 ether;

    bool public activeBribes = true;
    bool public activeIncentives = false;

    struct Pixel {
        address account;
        address faction;
        string color;
    }

    uint256 public totalPlaced;
    mapping(uint256 => Pixel) public index_Pixel;
    mapping(address => uint256) public faction_Balance;
    mapping(address => uint256) public faction_Placed;

    mapping(address => uint256) public account_Placed;
    mapping(address => mapping(address => uint256)) public account_Faction_Balance;
    mapping(address => mapping(address => uint256)) public account_Faction_Placed;

    error Plugin__InvalidIndex();
    error Plugin__NotAuthorizedVoter();
    error Plugin__InvalidCapacity();
    error Plugin__InvalidZeroAddress();
    error Plugin__NotAuthorizedDeveloper();

    event Plugin__Placed(address indexed account, address indexed faction, uint256 index, string color);
    event Plugin__ClaimedAndDistributed(
        uint256 bribeAmount, uint256 incentivesAmount, uint256 developerAmount, uint256 treasuryAmount
    );
    event Plugin__PriceSet(uint256 price);
    event Plugin__CapacitySet(uint256 capacity);
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
        address _token,
        address _voter,
        address[] memory _assetTokens,
        address[] memory _bribeTokens,
        address _treasury,
        address _developer,
        address _vaultFactory
    ) {
        token = IERC20(_token);
        voter = _voter;
        assetTokens = _assetTokens;
        bribeTokens = _bribeTokens;
        treasury = _treasury;
        developer = _developer;
        incentives = _treasury;

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

    function placeFor(address account, address faction, uint256 index, string calldata color) external nonReentrant {
        if (index >= capacity) revert Plugin__InvalidIndex();

        Pixel memory prevPixel = index_Pixel[index];
        index_Pixel[index] = Pixel(account, faction, color);

        if (prevPixel.account != address(0)) {
            faction_Balance[prevPixel.faction] -= AMOUNT;
            account_Faction_Balance[prevPixel.account][prevPixel.faction] -= AMOUNT;

            IGauge(gauge)._withdraw(prevPixel.account, AMOUNT);
            IRewardVault(rewardVault).delegateWithdraw(prevPixel.account, AMOUNT);
            VaultToken(vaultToken).burn(address(this), AMOUNT);
        }

        uint256 fee = price / 20;

        totalPlaced += AMOUNT;
        account_Placed[account] += AMOUNT;
        faction_Balance[faction] += AMOUNT;
        account_Faction_Balance[account][faction] += AMOUNT;
        faction_Placed[faction] += AMOUNT;
        account_Faction_Placed[account][faction] += AMOUNT;

        if (faction != address(0)) {
            token.safeTransferFrom(msg.sender, faction, fee);
            token.safeTransferFrom(msg.sender, address(this), price - fee);
        } else {
            token.safeTransferFrom(msg.sender, address(this), price);
        }

        IGauge(gauge)._deposit(account, AMOUNT);
        VaultToken(vaultToken).mint(address(this), AMOUNT);
        IERC20(vaultToken).safeApprove(rewardVault, 0);
        IERC20(vaultToken).safeApprove(rewardVault, AMOUNT);
        IRewardVault(rewardVault).delegateStake(account, AMOUNT);

        emit Plugin__Placed(account, faction, index, color);
    }

    function setActiveBribes(bool _activeBribes) external onlyOwner {
        activeBribes = _activeBribes;
        emit Plugin__ActiveBribesSet(activeBribes);
    }

    function setActiveIncentives(bool _activeIncentives) external onlyOwner {
        activeIncentives = _activeIncentives;
        emit Plugin__ActiveIncentivesSet(activeIncentives);
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
        emit Plugin__PriceSet(_price);
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
