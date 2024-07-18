// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

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

interface IWBERA {
    function deposit() external payable;
}

contract BentoPlugin is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    uint256 public constant AMOUNT = 1e16;
    uint256 public constant X_MAX = 256;
    uint256 public constant Y_MAX = 256;
    uint256 public constant DURATION = 7 days;
    string public constant SYMBOL = "BENTO";
    string public constant PROTOCOL = "BentoBera";

    /*----------  STATE VARIABLES  --------------------------------------*/

    IERC20Metadata private immutable underlying;
    address private immutable OTOKEN;
    address private immutable voter;
    address private gauge;
    address private bribe;
    address[] private tokensInUnderlying;
    address[] private bribeTokens;

    address public treasury;

    struct Tile {
        uint256 color;
        address account;
    }

    string[] public colors;
    uint256 public totalPlaced;
    mapping(address => uint256) public account_Placed;
    Tile[X_MAX][Y_MAX] public tiles;

    /*----------  ERRORS ------------------------------------------------*/

    error Plugin__InvalidColor();
    error Plugin__InvalidInput();
    error Plugin__InvalidZeroInput();
    error Plugin__NotAuthorizedVoter();
    error Plugin__InsufficientFunds();

    /*----------  EVENTS ------------------------------------------------*/

    event Plugin__Placed(address indexed account, address indexed prevAccount, uint256 x, uint256 y, uint256 color);
    event Plugin__ClaimedAnDistributed();

    /*----------  MODIFIERS  --------------------------------------------*/

    modifier nonZeroInput(uint256 _amount) {
        if (_amount == 0) revert Plugin__InvalidZeroInput();
        _;
    }

    modifier onlyVoter() {
        if (msg.sender != voter) revert Plugin__NotAuthorizedVoter();
        _;
    }

    /*----------  FUNCTIONS  --------------------------------------------*/

    constructor(
        address _underlying,                    // WBERA
        address _voter, 
        address[] memory _tokensInUnderlying,   // [WBERA]
        address[] memory _bribeTokens,          // [WBERA]
        address _treasury
    ) {
        underlying = IERC20Metadata(_underlying);
        voter = _voter;
        tokensInUnderlying = _tokensInUnderlying;
        bribeTokens = _bribeTokens;
        treasury = _treasury;
        OTOKEN = IVoter(_voter).OTOKEN();
    }

    function claimAndDistribute() 
        external 
        nonReentrant
    {
        uint256 balance = address(this).balance;
        if (balance > DURATION) {
            uint256 treasuryFee = balance / 10;
            address token = getUnderlyingAddress();
            IWBERA(token).deposit{value: balance}();
            if (bribe != address(0)) {
                IERC20(token).safeTransfer(treasury, treasuryFee);
                IERC20(token).safeApprove(bribe, 0);
                IERC20(token).safeApprove(bribe, balance - treasuryFee);
                IBribe(bribe).notifyRewardAmount(token, balance - treasuryFee);
            } else {
                IERC20(token).safeTransfer(treasury, balance);
            }

        }
    }

    function placeFor(address account, uint256[] calldata x, uint256[] calldata y, uint256 color) 
        external
        payable
        nonReentrant
    {
        if (color >= colors.length) revert Plugin__InvalidColor();
        if (x.length == 0) revert Plugin__InvalidInput();
        if (x.length != y.length) revert Plugin__InvalidInput();
        for (uint256 i = 0; i < x.length; i++) {
            if (x[i] > X_MAX || y[i] > Y_MAX) revert Plugin__InvalidInput();
            address prevAccount = tiles[x[i]][y[i]].account;
            tiles[x[i]][y[i]].color = color;
            tiles[x[i]][y[i]].account = account;
            if (prevAccount != address(0)) {
                if (gauge != address(0)) IGauge(gauge)._withdraw(prevAccount, AMOUNT);
            }
            emit Plugin__Placed(account, prevAccount, x[i], y[i], color);
        }
        uint256 amount = AMOUNT * x.length;
        if (msg.value != amount) revert Plugin__InsufficientFunds();
        totalPlaced += amount;
        account_Placed[account] += amount;
        if (gauge != address(0)) IGauge(gauge)._deposit(account, amount);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setColors(string[] memory _colors) external onlyOwner {
        colors = _colors;
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

    function getUnderlyingName() public view virtual returns (string memory) {
        return SYMBOL;
    }

    function getUnderlyingSymbol() public view virtual returns (string memory) {
        return SYMBOL;
    }

    function getUnderlyingAddress() public view virtual returns (address) {
        return address(underlying);
    }

    function getUnderlyingDecimals() public view virtual returns (uint8) {
        return underlying.decimals();
    }

    function getProtocol() public view virtual returns (string memory) {
        return PROTOCOL;
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

    function getTokensInUnderlying() public view virtual returns (address[] memory) {
        return tokensInUnderlying;
    }

    function getBribeTokens() public view returns (address[] memory) {
        return bribeTokens;
    }

    function getColors() public view returns (string[] memory) {
        return colors;
    }

    function getTile(uint256 x, uint256 y) public view returns (uint256 color, address account) {
        require(x < X_MAX && y < Y_MAX, "Invalid coordinates");
        Tile memory tile = tiles[x][y];
        return (tile.color, tile.account);
    }

    function getRow(uint256 y) public view returns (Tile[] memory) {
        require(y < Y_MAX, "Invalid row index");
        Tile[] memory rowTiles = new Tile[](X_MAX);

        for (uint256 x = 0; x < X_MAX; x++) {
            rowTiles[x] = tiles[x][y];
        }
        return rowTiles;
    }

    function getColumn(uint256 x) public view returns (Tile[] memory) {
        require(x < X_MAX, "Invalid column index");
        Tile[] memory columnTiles = new Tile[](Y_MAX);

        for (uint256 y = 0; y < Y_MAX; y++) {
            columnTiles[y] = tiles[x][y];
        }
        return columnTiles;
    }

    function getGridChunk(uint256 startX, uint256 startY, uint256 endX, uint256 endY) 
        public view returns (Tile[][] memory) 
    {
        require(startX < X_MAX && endX < X_MAX && startY < Y_MAX && endY < Y_MAX, "Invalid coordinates");
        require(startX <= endX && startY <= endY, "Invalid chunk coordinates");

        uint256 width = endX - startX + 1;
        uint256 height = endY - startY + 1;

        Tile[][] memory chunkTiles = new Tile[][](width);

        for (uint256 x = 0; x < width; x++) {
            chunkTiles[x] = new Tile[](height);
            for (uint256 y = 0; y < height; y++) {
                chunkTiles[x][y] = tiles[startX + x][startY + y];
            }
        }
        return chunkTiles;
    }

}