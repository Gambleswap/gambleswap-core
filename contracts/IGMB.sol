// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IGMBToken {

    event NewPool(address indexed addr);

    function addNewPool(address pool) external;

    function authorisedPools(uint256 index) external view returns (address);

    function getAuthorisedPoolsLength() external view returns (uint256);
}