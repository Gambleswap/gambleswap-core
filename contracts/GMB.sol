// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GMBToken is ERC20 {

    address public admin;
    address public gamblingContract;
    poolInfo[] authorisedPools;

    struct poolInfo{
        address poolAddress;
        uint256 rewardsPerBlock;
    }

    event NewPool(address indexed addr, uint256 reward);

    constructor(uint256 initialSupply) public ERC20("GMB Token", "GMB") {
        admin = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }

    modifier onlyGamblingContract {
        require(msg.sender == gamblingContract, "Only the GambleContract can call this function");
        _;
    }

    modifier onlyAuthorizedPools {
        bool isAuthorized = false;
        for(uint i=0; i<authorisedPools.length; i++) {
            if(authorisedPools[i].poolAddress == msg.sender) {
                isAuthorized = true;
            }
        }
        require(isAuthorized == true, "Only authorized pool can call mint");
        _;
    }

    function setGamblingContractAddess(address addr) external onlyAdmin {
        gamblingContract = addr;
    }

    function mint(address account, uint256 amount) external onlyAuthorizedPools {
        _mint(account, amount);
    }

    function burn(uint amount) external onlyGamblingContract {
        address gamblingContractAddr = msg.sender;
        _burn(gamblingContractAddr, amount);
    }

    function addNewPool(address pool, uint256 rewards) onlyAdmin public{
        poolInfo memory pi = poolInfo(pool, rewards);
        authorisedPools.push(pi);
        emit NewPool(pi.poolAddress, pi.rewardsPerBlock);
    }

}