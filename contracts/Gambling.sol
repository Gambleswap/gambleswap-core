// SPDX-License-Identifier: MIT

import "./GMB.sol";
import "hardhat/console.sol";

pragma solidity ^0.8.3;

contract Gambling {

    GMBToken gmbTokenContract;
    address admin;

    struct ParticipationData {
        address addr;
        uint gmbToken;
        uint betValue;
    }
    struct WinnerData {
        address addr;
        bool claimed; 
    }

    mapping (address => bool) isParticipated;
    ParticipationData[] participations;
    WinnerData[] winners;

    constructor(address GMBContractAddr) {
        gmbTokenContract = GMBToken(GMBContractAddr);
        admin = msg.sender;
    }
    
    function participate(uint gmbToken, uint betValue) public {
        address accountAddr = msg.sender;
        require(gmbToken > 0, "GMB token must be more than zero");
        require(isParticipated[accountAddr] == false, 
                "You cannot participate in gambling more than once");
        require(gmbTokenContract.balanceOf(msg.sender) >= gmbToken, 
                "You have insufficient GMB Token");
        
        //TODO: Check if sender has LPTokens
        //TODO: Lock LPTokens

        isParticipated[accountAddr] = true;
        participations.push(ParticipationData(accountAddr, gmbToken, betValue));
        
        //Send GMB tokens from the user to the gamblingContract
        gmbTokenContract.transferToAdmin(accountAddr, gmbToken);
    }

    function _generate_random_number() public view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.gaslimit + uint256(blockhash(block.number)) +
        ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
        block.number)));

        return (seed - ((seed / 1000) * 1000));
    }

    function _removeLastParticipations() private {
        for (uint i = 0; i < participations.length; i++) {
            isParticipated[participations[i].addr] = false;
        }
        delete participations;
    }

    function _intervalUnit(uint interval) view private returns (uint) {
        uint sumOfGMBTokens = 0;
        for (uint i = 0; i < participations.length; i++) {
            sumOfGMBTokens += participations[i].gmbToken;
        }
        return interval / sumOfGMBTokens;
    }

    function _isWinner(uint betValue, uint winnerInterval, uint randomNumber, uint maxRandomNumber)
      public returns(bool){
        bool negativeOverflow = randomNumber < winnerInterval;
        bool positiveOverflow = randomNumber + winnerInterval > maxRandomNumber;
        bool isWinner = false;
        if(negativeOverflow) {
            uint overflowValue = winnerInterval - randomNumber;
            isWinner =  (betValue > (maxRandomNumber - overflowValue) && betValue <= maxRandomNumber) || 
                        (betValue >= 0 && betValue < (randomNumber + winnerInterval));

        } else if (positiveOverflow) {
            uint overflowValue = randomNumber + winnerInterval - maxRandomNumber;
            isWinner =  (betValue > (randomNumber - winnerInterval) && betValue <= maxRandomNumber)  || 
                        (betValue >= 0 && betValue < (overflowValue));
        } else {
            isWinner = betValue > (randomNumber - winnerInterval) && betValue < (randomNumber + winnerInterval);
        }
        return isWinner;
    }

    //TODO: increase interval
    function _determine_winners(uint256 randomNumber) private {
        uint maxRandomNumber = 1000;
        uint initialInterval = 100;
        uint intervalUint = _intervalUnit(initialInterval);
        uint winnerInterval;
        for (uint i = 0; i < participations.length; i++) {
            uint betValue = participations[i].betValue;
            address accountAddr = participations[i].addr;
            //TODO: Remove this line
            randomNumber = 500;
            winnerInterval = intervalUint * participations[i].gmbToken;
            if (_isWinner(betValue, winnerInterval, randomNumber, maxRandomNumber)) {
                winners.push(WinnerData(accountAddr, false));
            }
        }
    }

    function printWinners() view public {
        console.log(winners.length);
        for (uint i = 0; i < winners.length; i++) {
            console.log(winners[i].addr);
        }
    }

    //TODO: Add onlyAdmin
    function endTurn() public {
        delete winners;

        uint256 randomNumber = _generate_random_number();

        _determine_winners(randomNumber);

        _removeLastParticipations();

        //TODO: Burn 1/4 of the jackpot
    }

    function claim()  public {
        //TODO: check if is winner or not
    }
}