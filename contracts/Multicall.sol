// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBentoPlugin {
    struct Pixel {
        uint256 color;
        address account;
    }
    function placeFor(address account, uint256[] calldata x, uint256[] calldata y, uint256 color)  external payable;
    function getGauge() external view returns (address);
    function placePrice() external view returns (uint256);
    function getPixel(uint256 x, uint256 y) external view returns (Pixel memory);
    function getRow(uint256 y) external view returns (Pixel[] memory);
    function getColumn(uint256 x) external view returns (Pixel[] memory);
    function getGridChunk(uint256 startX, uint256 startY, uint256 endX, uint256 endY) external view returns (Pixel[][] memory);
}

interface IGauge {
    function totalSupply() external view returns (uint256);
    function getRewardForDuration(address token) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function earned(address account, address token) external view returns (uint256);
}

interface IVoter {
    function getReward(address account) external;
}

contract Multicall {

    address public immutable plugin;
    address public immutable voter;
    address public immutable oBERO;

    struct GaugeState {
        uint256 rewardPerToken;
        uint256 totalSupply;
        uint256 balance;
        uint256 earned;
        uint256 oBeroBalance;
    }

    constructor(address _plugin, address _voter, address _oBERO) {
        plugin = _plugin;
        voter = _voter;
        oBERO = _oBERO;
    }

    function placeFor(address account, uint256[] calldata x, uint256[] calldata y, uint256 color) external payable {
        IBentoPlugin(plugin).placeFor{value: msg.value}(account, x, y, color);
    }

    function getReward(address account) external {
        IVoter(voter).getReward(account);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function getPlacePrice() external view returns (uint256) {
        return IBentoPlugin(plugin).placePrice();
    }

    function getGauge(address account) external view returns (GaugeState memory gaugeState) {
        address gauge = IBentoPlugin(plugin).getGauge();
        if (gauge != address(0)) {
            gaugeState.rewardPerToken = IGauge(gauge).totalSupply() == 0 ? 0 : (IGauge(gauge).getRewardForDuration(oBERO) * 1e18 / IGauge(gauge).totalSupply());
            gaugeState.totalSupply = IGauge(gauge).totalSupply();
            gaugeState.balance = IGauge(gauge).balanceOf(account);
            gaugeState.earned = IGauge(gauge).earned(account, oBERO);
            gaugeState.oBeroBalance = IERC20(oBERO).balanceOf(account);
        }
    }

    function getPixel(uint256 x, uint256 y) external view returns (IBentoPlugin.Pixel memory) {
        return IBentoPlugin(plugin).getPixel(x, y);
    }

    function getRow(uint256 y) external view returns (IBentoPlugin.Pixel[] memory) {
        return IBentoPlugin(plugin).getRow(y);
    }

    function getColumn(uint256 x) external view returns (IBentoPlugin.Pixel[] memory) {
        return IBentoPlugin(plugin).getColumn(x);
    }

    function getGridChunk(uint256 startX, uint256 startY, uint256 endX, uint256 endY) external view returns (IBentoPlugin.Pixel[][] memory) {
        return IBentoPlugin(plugin).getGridChunk(startX, startY, endX, endY);
    }

}