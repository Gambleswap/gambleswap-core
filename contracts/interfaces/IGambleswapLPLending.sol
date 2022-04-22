// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

interface IGambleswapLPLending {

    event newPoolAdded(address indexed);
    event Borrow(address indexed, address indexed, uint);
    event Return(address indexed, address indexed);
    event Lend(address indexed, address indexed, uint);
    event ExitLend(address indexed, address indexed, uint);
    event Refresh(uint);

    function addPool(address addr, uint) external;

    function exitLendingPool(uint index) external;

    function lend(uint index, uint amount) external;

    function getCheapestPool() external view returns (uint);

    function borrow(address borrower) external;

    function refresh() external;

}
