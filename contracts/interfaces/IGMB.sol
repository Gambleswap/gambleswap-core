// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IGMBToken {

    event NewPool(address indexed addr);

    function addNewPool(address pool) external;

    function authorisedPools(uint256 index) external view returns (address);

    function getAuthorisedPoolsLength() external view returns (uint256);

    function mint(address account, uint256 amount) external;

    function setGamblingContractAddess(address addr) external;

    function burn(uint amount) external;

}