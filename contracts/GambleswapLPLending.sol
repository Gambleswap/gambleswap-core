// SPDX-License-Identifier: MIT

import "./interfaces/IGambleswapLPLending.sol";
import './interfaces/IERC20.sol';

contract GambleswapLPLending is IGambleswapLPLending {

    mapping (uint => pool) override public pools;
    mapping (uint => mapping(address => lender)) override public lenders;
    
    uint override public poolsNumber;
    address admin;
    address GMB;
    address gambling;

    modifier onlyAdmin {
        require(msg.sender == admin, "only admin can do this.");
        _;
    }

    modifier onlyGambling {
        require(msg.sender == gambling, "only gambling contract can do this");
        _;
    }

    constructor(address gmbAddress, address gamblingAddress) {
        admin = msg.sender;
        GMB=gmbAddress;
        gambling = gamblingAddress;
    }


    function addPool(address addr, uint interest) onlyAdmin public  override{
        poolsNumber++;
        pools[poolsNumber].lpTokenAddress = addr;
        pools[poolsNumber].lendersNum = 0;
        pools[poolsNumber].totalLiquidity = 0;
        pools[poolsNumber].valid = true;
        pools[poolsNumber].interestPerBorrow = interest;

        emit newPoolAdded(addr);
    }

    function exitLendingPool(uint index) public override{
        pool storage p = pools[index];
        lender storage l = lenders[index][msg.sender];
        require(l.valid, "you've never joined this pool before");
        uint interest = l.amount * (p.interestPerShare - l.debtPerShare);
        IERC20(GMB).transfer(msg.sender, interest/1e12);
        IERC20(p.lpTokenAddress).transfer(msg.sender, l.amount);
        p.totalLiquidity -= l.amount;
        l.debtPerShare = p.interestPerShare;
        l.amount = 0;
        l.valid = false;
        p.lendersNum -= 1;

        emit ExitLend(msg.sender, p.lpTokenAddress, interest);
    }

    function lend(uint index, uint amount) public  override{
        require(index <= poolsNumber && index >= 1, "pool index not in range");
        pool storage p = pools[index];
        lender storage l = lenders[index][msg.sender];
        IERC20(p.lpTokenAddress).transferFrom(msg.sender, address(this), amount);
        if (l.valid) {
            IERC20(GMB).transfer(msg.sender, l.amount * (p.interestPerShare - l.debtPerShare));
            l.debtPerShare = p.interestPerShare;
        }
        else {
            l.valid = true;
            l.debtPerShare = p.interestPerShare;
            p.lendersNum += 1;
        }
        l.amount += amount;
        p.totalLiquidity += amount;

        emit Lend(msg.sender, p.lpTokenAddress, amount);
    }

    function getCheapestPool() public view override returns (uint res) {
        res = 1;
        for (uint256 index = 1; index <= poolsNumber; index++) {
            if (pools[index].interestPerBorrow < pools[index].interestPerBorrow){
                uint fundsRemaining = pools[index].totalLiquidity - pools[index].totalLiquidityBorrowed;
                if (IERC20(pools[index].lpTokenAddress).totalSupply() < fundsRemaining * 1e4)
                    res = index;
            }
        }
        return res;
    }

    function borrow(address borrower) onlyGambling public  override{
        pool storage p = pools[getCheapestPool()];
        IERC20 lpToken = IERC20(p.lpTokenAddress);
        p.totalLiquidityBorrowed += lpToken.totalSupply() / 1e4;
        IERC20(GMB).transferFrom(borrower, address(this), p.interestPerBorrow);
        p.interestPerShare += p.interestPerBorrow * 1e12 / p.totalLiquidity;

        emit Borrow(borrower, p.lpTokenAddress, p.interestPerBorrow);
    }

    function refresh() onlyGambling public override{
        for (uint256 index = 1; index <= poolsNumber; index++)
            pools[index].totalLiquidityBorrowed = 0;
            
        emit Refresh(block.number);
    }
}