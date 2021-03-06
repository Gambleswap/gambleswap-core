// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

interface IGambleswapPair {

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function lending() external view returns (address);
    function gambling() external view returns (address);
    function GMBPERBLOCK() external view returns (uint);
    function gmb() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;
    function claimGMB(address user) external;
    function updateDebt(address user) external;

    function initialize(address, address, address, address, address) external;
    function setLending(address) external;
}
