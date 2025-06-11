// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMapPlugin {
    struct Pixel {
        address account;
        address faction;
        string color;
    }
    function placeFor(address account, address faction, uint256 index, string calldata color) external;
    function getGauge() external view returns (address);
    function price() external view returns (uint256);
    function getPixel(uint256 index) external view returns (Pixel memory);
    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (Pixel[] memory);
    function totalPlaced() external view returns (uint256);
    function faction_Balance(address faction) external view returns (uint256);
    function faction_Placed(address faction) external view returns (uint256);
    function account_Placed(address account) external view returns (uint256);
    function account_Faction_Balance(address account, address faction) external view returns (uint256);
    function account_Faction_Placed(address account, address faction) external view returns (uint256);
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

contract Multicall is Ownable {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    /*----------  STATE VARIABLES  --------------------------------------*/

    address public immutable base;
    address public immutable plugin;
    address public immutable voter;
    address public immutable oBERO;

    address[] public factions;
    string[] public names;

    struct AccountState {
        uint256 balance;
        uint256 placed;
        uint256[] factionBalance;
        uint256[] factionPlaced;
    }

    struct GaugeState {
        uint256 rewardPerToken;
        uint256 totalSupply;
        uint256 balance;
        uint256 earned;
        uint256 oBeroBalance;
    }

    struct FactionState {
        string name;
        address owner;
        uint256 balance;
        uint256 totalPlaced;
    }

    /*----------  ERRORS ------------------------------------------------*/

    error Multicall__InvalidArrayLength();

    /*----------  EVENTS ------------------------------------------------*/

    /*----------  FUNCTIONS  --------------------------------------------*/

    constructor(address _base, address _plugin, address _voter, address _oBERO) {
        base = _base;
        plugin = _plugin;
        voter = _voter;
        oBERO = _oBERO;
    }

    function placeFor(address account, address faction, uint256[] calldata indexes, string[] calldata colors) external payable {
        IWBERA(base).deposit{value: msg.value}();
        IERC20(base).safeApprove(plugin, 0);
        IERC20(base).safeApprove(plugin, msg.value);
        for (uint256 i = 0; i < indexes.length; i++) {
            IMapPlugin(plugin).placeFor(account, faction, indexes[i], colors[i]);
        }
    }

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function setFactions(address[] calldata _factions, string[] calldata _names) external onlyOwner {
        if (_factions.length != _names.length) revert Multicall__InvalidArrayLength();
        delete factions;
        delete names;

        for (uint256 i = 0; i < _factions.length; i++) {
            factions.push(_factions[i]);
            names.push(_names[i]);
        }
    }

    /*----------  VIEW FUNCTIONS  ---------------------------------------*/

    function getReward(address account) external {
        IGauge(IMapPlugin(plugin).getGauge()).getReward(account);
    }

    receive() external payable {}

    function getPrice() external view returns (uint256) {
        return IMapPlugin(plugin).price();
    }

    function getGauge(address account) external view returns (GaugeState memory gaugeState) {
        address gauge = IMapPlugin(plugin).getGauge();
        gaugeState.rewardPerToken = IGauge(gauge).totalSupply() == 0 ? 0 : (IGauge(gauge).getRewardForDuration(oBERO) * 1e18 / IGauge(gauge).totalSupply());
        gaugeState.totalSupply = IGauge(gauge).totalSupply();
        gaugeState.balance = IGauge(gauge).balanceOf(account);
        gaugeState.earned = IGauge(gauge).earned(account, oBERO);
        gaugeState.oBeroBalance = IERC20(oBERO).balanceOf(account);
    }

    function getAccountState(address account) external view returns (AccountState memory accountState) {
        address gauge = IMapPlugin(plugin).getGauge();
        accountState.balance = IGauge(gauge).balanceOf(account);
        accountState.placed = IMapPlugin(plugin).account_Placed(account);
        uint256 maxFactions = factions.length;
        accountState.factionBalance = new uint256[](maxFactions);
        accountState.factionPlaced = new uint256[](maxFactions);
        for (uint256 i = 0; i < maxFactions; i++) {
            accountState.factionBalance[i] = IMapPlugin(plugin).account_Faction_Balance(account, factions[i]);
            accountState.factionPlaced[i] = IMapPlugin(plugin).account_Faction_Placed(account, factions[i]);
        }
    }

    function getFactions() external view returns (FactionState[] memory) {
        uint256 maxFactions = factions.length;
        FactionState[] memory factionStates = new FactionState[](maxFactions);
        for (uint256 i = 0; i < maxFactions; i++) {
            factionStates[i] = FactionState(
                names[i],   
                factions[i],
                IMapPlugin(plugin).faction_Balance(factions[i]),
                IMapPlugin(plugin).faction_Placed(factions[i])
            );
        }
        return factionStates;
    }

    function getPixel(uint256 index) external view returns (IMapPlugin.Pixel memory) {
        return IMapPlugin(plugin).getPixel(index);
    }

    function getPixels(uint256 startIndex, uint256 endIndex) external view returns (IMapPlugin.Pixel[] memory) {
        return IMapPlugin(plugin).getPixels(startIndex, endIndex);
    }

}