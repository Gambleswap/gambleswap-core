/**
 *Submitted for verification at Etherscan.io on 2022-01-18
*/

//SPDX-License-Identifier: MIT;
pragma solidity >=0.8.0;

import './IERC20.sol';

contract UniToken is IERC20{
    string public override  name;
    string public override  symbol;
    string constant public standard = "v2.0";
    uint256 immutable public override  totalSupply;
    uint8  immutable public override decimals; //we can have 1.000000000000000001 token


    mapping(address => uint256) public override  balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor (uint256 _initialSupply, uint8 _decimals, string memory _name, string memory _symbol) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        decimals = _decimals;
    }

    function transfer(address _to, uint256 _value) public override returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient amount.");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        success = true;
    }

    function approve(address _spender, uint256 _value) public override returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to ,uint256 _value) public override returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        //default behavior if we do not have _to address
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}