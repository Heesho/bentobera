// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Faction is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant DURATION = 7 days; // rewards are released over 7 days

    address public immutable plugin;                 // address of plugin contract

    struct Reward {
        uint256 periodFinish;           // timestamp when reward period ends
        uint256 rewardRate;             // reward rate per second
        uint256 lastUpdateTime;         // timestamp when reward data was last updated
        uint256 rewardPerTokenStored;   // reward per virtual token stored
    }

    mapping(address => Reward) public rewardData;   // reward token -> reward data
    mapping(address => bool) public isRewardToken;  // reward token -> true if reward token
    address[] public rewardTokens;                  // array of reward tokens

    mapping(address => mapping(address => uint256)) public userRewardPerTokenPaid;  // user -> reward token -> reward per virtual token paid
    mapping(address => mapping(address => uint256)) public rewards;                 // user -> reward token -> reward amount

    uint256 private _totalSupply;                   // total supply of virtual tokens
    mapping(address => uint256) private _balances;  // user -> virtual token balance

    error Faction__NotPlugin();
    error Faction__RewardSmallerThanDuration();
    error Faction__RewardSmallerThanLeft();
    error Faction__NotRewardToken();
    error Faction__RewardTokenAlreadyAdded();
    error Faction__InvalidZeroInput();

    event Faction__RewardAdded(address indexed rewardToken);
    event Faction__RewardNotified(address indexed rewardToken, uint256 reward);
    event Faction__Deposited(address indexed user, uint256 amount);
    event Faction__Withdrawn(address indexed user, uint256 amount);
    event Faction__RewardPaid(address indexed user, address indexed rewardsToken, uint256 reward);

    modifier updateReward(address account) {
        for (uint256 i; i < rewardTokens.length; i++) {
            address token = rewardTokens[i];
            rewardData[token].rewardPerTokenStored = rewardPerToken(token);
            rewardData[token].lastUpdateTime = lastTimeRewardApplicable(token);
            if (account != address(0)) {
                rewards[account][token] = earned(account, token);
                userRewardPerTokenPaid[account][token] = rewardData[token]
                    .rewardPerTokenStored;
            }
        }
        _;
    }

    modifier onlyPlugin() {
        if (msg.sender != plugin) {
            revert Faction__NotPlugin();
        }
        _;
    }

    modifier nonZeroInput(uint256 _amount) {
        if (_amount == 0) revert Faction__InvalidZeroInput();
        _;
    }

    constructor(address _plugin) {
        plugin = _plugin;
    }

    function getReward(address account) 
        external 
        nonReentrant 
        updateReward(account) 
    {
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address _rewardsToken = rewardTokens[i];
            uint256 reward = rewards[account][_rewardsToken];
            if (reward > 0) {
                rewards[account][_rewardsToken] = 0;
                emit Faction__RewardPaid(account, _rewardsToken, reward);

                IERC20(_rewardsToken).safeTransfer(account, reward);
            }
        }
    }

    function notifyRewardAmount(address _rewardsToken, uint256 reward) 
        external 
        nonReentrant
        updateReward(address(0))
    {
        if (reward < DURATION) revert Faction__RewardSmallerThanDuration();
        if (reward < left(_rewardsToken)) revert Faction__RewardSmallerThanLeft();
        if (!isRewardToken[_rewardsToken]) revert Faction__NotRewardToken();

        IERC20(_rewardsToken).safeTransferFrom(msg.sender, address(this), reward);
        if (block.timestamp >= rewardData[_rewardsToken].periodFinish) {
            rewardData[_rewardsToken].rewardRate = reward / DURATION;
        } else {
            uint256 remaining = rewardData[_rewardsToken].periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardData[_rewardsToken].rewardRate;
            rewardData[_rewardsToken].rewardRate = (reward + leftover) / DURATION;
        }
        rewardData[_rewardsToken].lastUpdateTime = block.timestamp;
        rewardData[_rewardsToken].periodFinish = block.timestamp + DURATION;
        emit Faction__RewardNotified(_rewardsToken, reward);
    }

    function _deposit(uint256 amount, address account) 
        external
        onlyPlugin
        nonZeroInput(amount)
        updateReward(account)
    {
        _totalSupply = _totalSupply + amount;
        _balances[account] = _balances[account] + amount;
        emit Faction__Deposited(account, amount);
    }

    function _withdraw(uint256 amount, address account) 
        external
        onlyPlugin
        nonZeroInput(amount)
        updateReward(account)
    {
        _totalSupply = _totalSupply - amount;
        _balances[account] = _balances[account] - amount;
        emit Faction__Withdrawn(account, amount);
    }

    function addReward(address _rewardsToken) 
        external 
        onlyOwner
    {
        if (isRewardToken[_rewardsToken]) revert Faction__RewardTokenAlreadyAdded();
        isRewardToken[_rewardsToken] = true;
        rewardTokens.push(_rewardsToken);
        emit Faction__RewardAdded(_rewardsToken);
    }

    function left(address _rewardsToken) public view returns (uint256 leftover) {
        if (block.timestamp >= rewardData[_rewardsToken].periodFinish) return 0;
        uint256 remaining = rewardData[_rewardsToken].periodFinish - block.timestamp;
        return remaining * rewardData[_rewardsToken].rewardRate;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function lastTimeRewardApplicable(address _rewardsToken) public view returns (uint256) {
        return Math.min(block.timestamp, rewardData[_rewardsToken].periodFinish);
    }

    function rewardPerToken(address _rewardsToken) public view returns (uint256) {
        if (_totalSupply == 0) return rewardData[_rewardsToken].rewardPerTokenStored;
        return
            rewardData[_rewardsToken].rewardPerTokenStored + ((lastTimeRewardApplicable(_rewardsToken) - rewardData[_rewardsToken].lastUpdateTime) 
            * rewardData[_rewardsToken].rewardRate * 1e18 / _totalSupply);
    }

    function earned(address account, address _rewardsToken) public view returns (uint256) {
        return
            (_balances[account] * (rewardPerToken(_rewardsToken) - userRewardPerTokenPaid[account][_rewardsToken]) / 1e18) 
            + rewards[account][_rewardsToken];
    }

    function getRewardForDuration(address _rewardsToken) external view returns (uint256) {
        return rewardData[_rewardsToken].rewardRate * DURATION;
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }

}

contract FactionFactory {
    address public lastFaction;

    error FactionFactory__InvalidZeroAddress();

    event FactionFactory__FactionCreated(address indexed faction);

    function create(address plugin, address owner) external returns (address) {
        Faction faction = new Faction(plugin);
        faction.transferOwnership(owner);
        lastFaction = address(faction);
        emit FactionFactory__FactionCreated(lastFaction);
        return lastFaction;
    }
}