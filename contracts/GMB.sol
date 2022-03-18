// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;
 
//Safe Math Interface
 
contract SafeMath {
 
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
 
    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
 
    function safeMul(uint a, uint b) public pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
 
    function safeDiv(uint a, uint b) public pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}
 
 
//ERC Token Standard #20 Interface
 
interface ERC20Interface {
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function transfer(address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
 
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
 
//Actual token contract
 
contract GMBToken is ERC20Interface, SafeMath {
    string public symbol;
    string public  name;
    uint8 public decimals;
    uint public _totalSupply;
    //TODO: Set admin later
    address  public admin;
    address public gamblingContract;
    poolInfo[] authorisedPools;

    struct poolInfo{
        address poolAddress;
        uint256 rewardsPerBlock;
    }

    event NewPool(address indexed addr, uint256 reward);

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;
 
    constructor() public {
        symbol = "GMB";
        name = "GambleSwap Token";
        decimals = 18;
        _totalSupply = 10000;
        admin = msg.sender;
        balances[admin] = _totalSupply;
    }
 
    function totalSupply() external override view returns (uint) {
        return _totalSupply;
    }
 
    function balanceOf(address tokenOwner) external override view returns (uint balance) {
        return balances[tokenOwner];
    }
 
    function transfer(address to, uint tokens) external override returns (bool success) {
        balances[msg.sender] = safeSub(balances[msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
 
    function approve(address spender, uint tokens) external override returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
 
    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        balances[from] = safeSub(balances[from], tokens);
        allowed[from][msg.sender] = safeSub(allowed[from][msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        emit Transfer(from, to, tokens);
        return true;
    }
 
    function allowance(address tokenOwner, address spender) external override view returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }


    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }

    modifier onlyGamblingContract {
        require(msg.sender == gamblingContract, "Only the GambleContract can call this function");
        _;
    }

    function setGamblingContractAddess(address addr) external onlyAdmin {
        gamblingContract = addr;
    }

    //TODO: Add onlyGamblingContract modifier
    function transferToAdmin(address from, uint tokens) external returns (bool success) {
        balances[from] = safeSub(balances[from], tokens);
        balances[admin] = safeAdd(balances[admin], tokens);
        emit Transfer(msg.sender, admin, tokens);
        return true;
    }

    //TODO: Add onlyGamblingContract modifier
    function transferFromAdmin(address to, uint tokens) external returns (bool success) {
        balances[admin] = safeSub(balances[admin], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        emit Transfer(admin, to, tokens);
        return true;
    }

    //TODO: Add onlyGamblingContract modifier
    function burn(uint value) external returns (bool success) {
        require(balances[admin] >= value);
        balances[admin] -= value;
        _totalSupply -= value;
        return true;
    }

    function addNewPool(address pool, uint256 rewards) onlyAdmin public{
        poolInfo memory pi = poolInfo(pool, rewards);
        authorisedPools.push(pi);
        emit NewPool(pi.poolAddress, pi.rewardsPerBlock);
    }
}