pragma solidity >=0.5.16;

import './interfaces/IGambleswapPair.sol';
import './GambleswapERC20.sol';
import './libs/Math.sol';
import './libs/UQ112x112.sol';
import './interfaces/IERC20.sol';
import "hardhat/console.sol";
import './interfaces/IGambleswapFactory.sol';
import './interfaces/IGambleswapCallee.sol';
import './interfaces/IGMB.sol';

contract GambleswapPair is IGambleswapPair, GambleswapERC20 {
    using SafeMath  for uint;
    using UQ112x112 for uint224;

    uint public constant override MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    struct profile{
        uint debt;
        bool valid;
    }

    mapping (address=>profile) profiles;

    address public override factory;
    address public override token0;
    address public override token1;
    address public gmb;
    uint public GMBPERBLOCK;
    uint public gmbPerShare;
    uint public totalGMBShare;
    uint public lastUpdatedBlock;

    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    uint public override price0CumulativeLast;
    uint public override price1CumulativeLast;
    uint public override kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'Gambleswap: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, 'Gambleswap: FORBIDDEN'); // sufficient check
        _;
    }

    modifier forceClaim(address user) {
        if (balanceOf[user] != 0){
            _claimGMB(user);
        }
        _;
    }

    function getReserves() public view override returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function _safeTransfer(address token, address to, uint value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'Gambleswap: TRANSFER_FAILED');
    }

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);
    event MiningAmountChanged(uint112);

    constructor() public {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1, address _gmb) onlyFactory override external {
        token0 = _token0;
        token1 = _token1;
        gmb = _gmb;
        gmbPerShare = 0;
        totalGMBShare = 0;
        lastUpdatedBlock = block.number;
    }

    function changeMintingAmount(uint112 amount) public{
        address admin = IGambleswapFactory(factory).feeToSetter();
        require(msg.sender == admin, "only factory admin can set this");
        GMBPERBLOCK = amount;
        emit MiningAmountChanged(amount);
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, 'Gambleswap: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            // * never overflows, and + overflow is desired
            price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }

    // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        address feeTo = IGambleswapFactory(factory).feeTo();
        feeOn = feeTo != address(0);
        uint _kLast = kLast; // gas savings
        if (feeOn) {
            if (_kLast != 0) {
                uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
                uint rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint numerator = totalSupply.mul(rootK.sub(rootKLast));
                    uint denominator = rootK.mul(5).add(rootKLast);
                    uint liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }

    modifier updateGMBPerShare () {
        if (totalSupply != 0) {
            uint totalGMBMinted = totalSupply.mul(gmbPerShare).add((GMBPERBLOCK * (block.number - lastUpdatedBlock)));
            gmbPerShare = totalGMBMinted / totalSupply;
            console.log("calling update");
            console.log(GMBPERBLOCK);
            console.log(block.number - lastUpdatedBlock);
            console.log(gmbPerShare);
            console.log(totalGMBMinted);
            lastUpdatedBlock = block.number;
        }
        _;
    }
    
    function _claimGMB(address user) internal{
        if (balanceOf[user] == 0)
            return;
        uint remaining = gmbPerShare.mul(balanceOf[user]).sub(profiles[user].debt);
        updateDebt(user);
        // uint allPendingGMBs = gmbPerShare.mul(totalGMBShare).add(GMBPERBLOCK.mul(block.number.sub(lastUpdatedBlock)));
        // gmbPerShare = allPendingGMBs / totalGMBShare;
        // uint userReward = gmbPerShare.mul(profiles[user].share) / totalGMBShare;
        // totalGMBShare = totalGMBShare.sub(profiles[user].share);
        // gmbPerShare = totalGMBShare/GMBPERBLOCK;
        IGMBToken(gmb).mint(user, remaining);
    }

    function updateDebt(address user) override public {
        profiles[user].debt = gmbPerShare.mul(balanceOf[user]);
    }

    function claimGMB(address user) lock updateGMBPerShare override public{
        if(balanceOf[user] != 0)
            _claimGMB(user);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external updateGMBPerShare forceClaim(to) lock override returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        uint amount0 = balance0.sub(_reserve0);
        uint amount1 = balance1.sub(_reserve1);

        bool feeOn = _mintFee(_reserve0, _reserve1);
        uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
           _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'Gambleswap: INSUFFICIENT_LIQUIDITY_MINTED');
        uint prevBalance = balanceOf[to];
        _mint(to, liquidity);
        profiles[to].valid = true;
        if (prevBalance == 0) {
            profiles[to].debt = gmbPerShare*balanceOf[to];
        }
        _update(balance0, balance1, _reserve0, _reserve1);

        if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date

        // uint allPendingGMBs = gmbPerShare * totalGMBShare * (block.number - lastUpdatedBlock); // = GMBPERBLOCK * n
        // gmbPerShare = allPendingGMBs / totalGMBShare;
        // gmbPerShare * totalGMBShare + totalGMBShare*GMBPERBLOCK*n/(totalGMBShare + share) = 
        // gmbPerShareNew * n * totalGMBShare = 
        // GMBPERBLOCK * n / (totalGMBShare + share)

        // => gmbPerShare * totalGMBShare = totalGMBShare * (gmbPerShareNew * n - )

        // gmbPerShareNew * (totalGMBShare + share) = GMBPERBLOCK
        // gmbPerShareNew = GMBPERBLOCK / (totalGMBShare + share);
        // totalGMBShare*gmbPerShareNew = GMBPERBLOCK*totalGMBShare/(totalGMBShare + share);
        // gmbPerShareNew = GMBPERBLOCK/(totalGMBShare + share)

        // n * gmbPerShare * totalGMBShare = GMBPERBLOCK * n * totalGMBShare / (totalGMBShare + x);

        emit Mint(msg.sender, amount0, amount1);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function burn(address to) external updateGMBPerShare() forceClaim(to) lock override returns (uint amount0, uint amount1) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        address _token0 = token0;                                // gas savings
        address _token1 = token1;                                // gas savings
        uint balance0 = IERC20(_token0).balanceOf(address(this));
        uint balance1 = IERC20(_token1).balanceOf(address(this));
        uint liquidity = balanceOf[address(this)];

        bool feeOn = _mintFee(_reserve0, _reserve1);
        uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
        amount0 = liquidity.mul(balance0) / _totalSupply; // using balances ensures pro-rata distribution
        amount1 = liquidity.mul(balance1) / _totalSupply; // using balances ensures pro-rata distribution
        require(amount0 > 0 && amount1 > 0, 'Gambleswap: INSUFFICIENT_LIQUIDITY_BURNED');
        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
        emit Burn(msg.sender, amount0, amount1, to);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) override external lock {
        require(amount0Out > 0 || amount1Out > 0, 'Gambleswap: INSUFFICIENT_OUTPUT_AMOUNT');
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'Gambleswap: INSUFFICIENT_LIQUIDITY');

        uint balance0;
        uint balance1;
        { // scope for _token{0,1}, avoids stack too deep errors
        address _token0 = token0;
        address _token1 = token1;
        require(to != _token0 && to != _token1, 'Gambleswap: INVALID_TO');
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
        if (data.length > 0) IGambleswapCallee(to).gambleswapCall(msg.sender, amount0Out, amount1Out, data);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, 'Gambleswap: INSUFFICIENT_INPUT_AMOUNT');
        { // scope for reserve{0,1}Adjusted, avoids stack too deep errors
        uint balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
        uint balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
        require(balance0Adjusted.mul(balance1Adjusted) >= uint(_reserve0).mul(_reserve1).mul(1000**2), 'Gambleswap: K');
        }

        _update(balance0, balance1, _reserve0, _reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // force balances to match reserves
    function skim(address to) external override lock {
        address _token0 = token0; // gas savings
        address _token1 = token1; // gas savings
        _safeTransfer(_token0, to, IERC20(_token0).balanceOf(address(this)).sub(reserve0));
        _safeTransfer(_token1, to, IERC20(_token1).balanceOf(address(this)).sub(reserve1));
    }

    // force reserves to match balances
    function sync() external override lock {
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}
