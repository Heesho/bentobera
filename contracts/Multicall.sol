// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMapPlugin {
    struct Pixel {
        address account;
        address faction;
        string color;
    }
    function placeFor(address account, uint256 faction, uint256[] calldata indexes, string[] calldata colors) external;
    function getGauge() external view returns (address);
    function placePrice() external view returns (uint256);
    function getFaction(uint256 index) external view returns (address faction, bool isActive);
    function getPixel(uint256 index) external view returns (Pixel memory);
    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (Pixel[] memory);
    function factionMax() external view returns (uint256);
    function index_Faction(uint256 index) external view returns (address);
    function faction_Index(address faction) external view returns (uint256);
    function faction_Active(address faction) external view returns (bool);
}

interface IFaction {
    function owner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function getRewardTokens() external view returns (address[] memory);
    function getRewardForDuration(address token) external view returns (uint256);
    function left(address token) external view returns (uint256);
    function earned(address account, address token) external view returns (uint256);
    function getReward(address account) external;
}

interface IGauge {
    function totalSupply() external view returns (uint256);
    function getRewardForDuration(address token) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function earned(address account, address token) external view returns (uint256);
    function getReward(address account) external;
}

interface IWBERA {
    function deposit() external payable;
}

contract Multicall {
    using SafeERC20 for IERC20;

    address public immutable base;
    address public immutable plugin;
    address public immutable voter;
    address public immutable oBERO;

    struct FactionState {
        address owner;
        uint256 balance;
        uint256 totalSupply;
        address[] rewardTokens;
        uint256[] rewardPerToken;
        uint256[] left;
        uint256[] earned;
    }

    struct GaugeState {
        uint256 rewardPerToken;
        uint256 balance;
        uint256 totalSupply;
        uint256 earned;
        uint256 oBeroBalance;
    }

    struct AccountState {
        GaugeState gauge;
        FactionState[] factions;
    }

    constructor(address _base, address _plugin, address _voter, address _oBERO) {
        base = _base;
        plugin = _plugin;
        voter = _voter;
        oBERO = _oBERO;
    }

    function placeFor(address account, uint256 faction, uint256[] calldata indexes, string[] calldata colors) external payable {
        IWBERA(base).deposit{value: msg.value}();
        IERC20(base).safeApprove(plugin, 0);
        IERC20(base).safeApprove(plugin, msg.value);
        IMapPlugin(plugin).placeFor(account, faction, indexes, colors);
    }

    function getReward(address account) external {
        IGauge(IMapPlugin(plugin).getGauge()).getReward(account);
        for (uint256 i = 0; i < IMapPlugin(plugin).factionMax(); i++) {
            address faction = IMapPlugin(plugin).index_Faction(i + 1);
            IFaction(faction).getReward(account);
        }
    }

    receive() external payable {}

    function getPlacePrice() external view returns (uint256) {
        return IMapPlugin(plugin).placePrice();
    }

    function getGauge(address account) public view returns (GaugeState memory gaugeState) {
        address gauge = IMapPlugin(plugin).getGauge();
        gaugeState.rewardPerToken = IGauge(gauge).totalSupply() == 0 ? 0 : (IGauge(gauge).getRewardForDuration(oBERO) * 1e18 / IGauge(gauge).totalSupply());
        gaugeState.balance = IGauge(gauge).balanceOf(account);
        gaugeState.totalSupply = IGauge(gauge).totalSupply();
        gaugeState.earned = IGauge(gauge).earned(account, oBERO);
        gaugeState.oBeroBalance = IERC20(oBERO).balanceOf(account);
    }

    function getFaction(uint256 index, address account) public view returns (FactionState memory factionState) {
        address faction = IMapPlugin(plugin).index_Faction(index);
        factionState.owner = IFaction(faction).owner();
        factionState.balance = account == address(0) ? 0 : IFaction(faction).balanceOf(account);
        factionState.totalSupply = IFaction(faction).totalSupply();
        factionState.rewardTokens = IFaction(faction).getRewardTokens();
        for (uint256 i = 0; i < factionState.rewardTokens.length; i++) {
            factionState.rewardPerToken[i] = factionState.totalSupply == 0 ? 0 : (IFaction(faction).getRewardForDuration(factionState.rewardTokens[i]) * 1e18 / factionState.totalSupply);
            factionState.left[i] = factionState.totalSupply == 0 ? 0 : IFaction(faction).left(factionState.rewardTokens[i]);
            factionState.earned[i] = account == address(0) ? 0 : IFaction(faction).earned(account, factionState.rewardTokens[i]);
        }
    }

    function getFactions() external view returns (FactionState[] memory factions) {
        factions = new FactionState[](IMapPlugin(plugin).factionMax());
        for (uint256 i = 0; i < IMapPlugin(plugin).factionMax(); i++) {
            factions[i] = getFaction(i + 1, address(0));
        }
    }

    function getAccountState(address account) external view returns (AccountState memory accountState) {
        accountState.gauge = getGauge(account);
        accountState.factions = new FactionState[](IMapPlugin(plugin).factionMax());
        for (uint256 i = 0; i < IMapPlugin(plugin).factionMax(); i++) {
            accountState.factions[i] = getFaction(i + 1, account);
        }
    }

    function getPixel(uint256 index) external view returns (IMapPlugin.Pixel memory) {
        return IMapPlugin(plugin).getPixel(index);
    }

    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (IMapPlugin.Pixel[] memory) {
        return IMapPlugin(plugin).getPixels(startIndex, endIndex);
    }

}