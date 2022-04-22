// SPDX-License-Identifier: MIT

pragma solidity >=0.5.16;

import './interfaces/IGambleswapFactory.sol';
import './GambleswapPair.sol';
import "hardhat/console.sol";

contract GambleswapFactory is IGambleswapFactory {
    address public override feeTo;
    address public override feeToSetter;
    address public override gmb;
    address public override gambling;
    address public override lending;

    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    constructor(address _feeToSetter, address _gmb, address _gambling, address _lending) public {
        feeToSetter = _feeToSetter;
        gmb = _gmb;
        lending = _lending;
        gambling = _gambling;
    }

    function allPairsLength() external view override returns (uint) {
        return allPairs.length;
    }

    function getInitHash() public view returns(bytes32){
        bytes memory bytecode = type(GambleswapPair).creationCode;
        console.logBytes(bytecode);
        return keccak256(abi.encodePacked(bytecode));
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, 'Gambleswap: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'Gambleswap: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'Gambleswap: PAIR_EXISTS'); // single check is sufficient
        bytes memory bytecode = type(GambleswapPair).creationCode;
        // console.logBytes32(getInitHash());
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IGambleswapPair(pair).initialize(token0, token1, gmb, gambling, lending);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) override external {
        require(msg.sender == feeToSetter, 'Gambleswap: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) override external {
        require(msg.sender == feeToSetter, 'Gambleswap: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}
