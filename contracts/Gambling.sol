// SPDX-License-Identifier: MIT

import "./GMB.sol";
import "hardhat/console.sol";

pragma solidity ^0.8.3;

contract Gambling {

    GMBToken gmbTokenContract;
    address admin;
    uint constant JackpotBurnPortion = 4;
    uint winnersTokens;

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

    modifier onlyAdmin {
        require(admin == msg.sender, "This is a restricted function for admin");
        _;
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

    function _jackpotValue() private view returns (uint) {
        uint sumOfGMBTokens = 0;
        for (uint i = 0; i < participations.length; i++) {
            sumOfGMBTokens += participations[i].gmbToken;
        }
        return sumOfGMBTokens;
    }

    function _intervalUnit(uint interval) view private returns (uint) {
        uint sumOfGMBTokens = _jackpotValue();
        return interval / sumOfGMBTokens;
    }

    function _correctGuess(uint betValue, uint winnerInterval, uint randomNumber, uint maxRandomNumber)
      public pure returns(bool){
        bool negativeOverflow = randomNumber < winnerInterval;
        bool positiveOverflow = randomNumber + winnerInterval > maxRandomNumber;
        bool correctGuess = false;
        if(negativeOverflow) {
            uint overflowValue = winnerInterval - randomNumber;
            correctGuess =  (betValue > (maxRandomNumber - overflowValue) && betValue <= maxRandomNumber) || 
                        (betValue >= 0 && betValue < (randomNumber + winnerInterval));

        } else if (positiveOverflow) {
            uint overflowValue = randomNumber + winnerInterval - maxRandomNumber;
            correctGuess =  (betValue > (randomNumber - winnerInterval) && betValue <= maxRandomNumber)  || 
                        (betValue >= 0 && betValue < (overflowValue));
        } else {
            correctGuess = betValue > (randomNumber - winnerInterval) && betValue < (randomNumber + winnerInterval);
        }
        return correctGuess;
    }

    //TODO: decide on maxRandomNumber and initialInterval
    function _determine_winners(uint256 randomNumber) private {
        uint maxRandomNumber = 1000;
        uint initialInterval = 100;
        uint intervalUint = _intervalUnit(initialInterval);
        uint winnerInterval;
        for (uint i = 0; i < participations.length; i++) {
            uint betValue = participations[i].betValue;
            address accountAddr = participations[i].addr;
            winnerInterval = intervalUint * participations[i].gmbToken;
            if (_correctGuess(betValue, winnerInterval, randomNumber, maxRandomNumber)) {
                winners.push(WinnerData(accountAddr, false));
            }
        }
    }

    function _isWinner(address addr) view public returns (bool, uint) {
        for (uint i = 0; i < winners.length; i++) {
            if (winners[i].addr == addr) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    //TODO: Add onlyAdmin
    function endTurn() public onlyAdmin returns (bool) {
        require(participations.length > 0, "There is no participant");
        delete winners;

        uint256 randomNumber = _generate_random_number();

        _determine_winners(randomNumber);

        uint jackpotValue = _jackpotValue();
        uint tokensToBurn = jackpotValue / JackpotBurnPortion;
        winnersTokens =  (jackpotValue - tokensToBurn) / winners.length;
        gmbTokenContract.burn(jackpotValue / JackpotBurnPortion);

        _removeLastParticipations();
        return true;
    }

    function claim() public returns (bool) {
        bool isWinner;
        uint index;
        (isWinner, index) = _isWinner(msg.sender);
        require(isWinner == true, "You didn't win, You cannot claim GMB token");
        require(winners[index].claimed == false, "You can claim only once");
        gmbTokenContract.transferFromAdmin(msg.sender, winnersTokens);
        winners[index].claimed = true;
        return true;
    }
}