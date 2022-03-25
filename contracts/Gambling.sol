// SPDX-License-Identifier: MIT

import "./interfaces/IGMB.sol";
import "./interfaces/IGambling.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity ^0.8.3;

contract Gambling is IGambling{

    address gmbTokenContract;
    address admin;
    uint constant JackpotBurnPortion = 4;
    uint QualificationThreshold = 1;
    uint maxRandomNumber = 5000000;
    uint initialInterval = 10;
    uint currentRound = 1;
    uint gameDuration = 2000;

    function getCurrentRound() public view returns(uint) {
        return currentRound;
    }

    function getCurrentRoundCoveragePerGMB() public view returns(uint) {
        return games[currentRound].coveragePerGMB;
    }

    struct game{
        uint winnerShare;
        WinnerData[] winners;
        ParticipationData[] participants;
        mapping (address => bool) isParticipated;
        uint256 randomNumber;
        uint coveragePerGMB;
        bool finished;
        bool valid;
    }

    struct ParticipationData {
        address addr;
        uint gmbToken;
        uint betValue;
    }
    struct WinnerData {
        address addr;
        bool claimed; 
    }

    mapping (uint=>game) games;

    constructor(address GMBContractAddr) {
        gmbTokenContract = GMBContractAddr;
        admin = msg.sender;
        games[0].coveragePerGMB = 10;
    }

    modifier onlyAdmin {
        require(admin == msg.sender, "This is a restricted function for admin");
        _;
    }

    function checkLPToken(address user) public view returns (address){
        for(uint256 i=0; i<IGMBToken(gmbTokenContract).getAuthorisedPoolsLength(); i++) {
            address authorizePoolAddr = IGMBToken(gmbTokenContract).authorisedPools(i);
            uint256 userBalance = IERC20(authorizePoolAddr).balanceOf(user);
            uint256 totalSupply = IERC20(authorizePoolAddr).totalSupply();
            if (userBalance * 1e4 > totalSupply){
                return authorizePoolAddr;
            }
        }
        return address(0);
    } 
    
    function participate(uint gmbToken, uint betValue) public {
        address user = msg.sender;
        require(gmbToken > 0, "GMB token must be more than zero");
        require(games[currentRound].isParticipated[user] == false, 
                "You cannot participate in gambling more than once");
        require(IERC20(gmbTokenContract).balanceOf(msg.sender) >= gmbToken, 
                "You have insufficient GMB Token");

        address lpAddress = checkLPToken(msg.sender);
        // TODO add LP lending
        require(lpAddress != address(0), "Not enough LP token");
        uint totalSupply = IERC20(lpAddress).totalSupply();
        console.log(totalSupply / 1e4);
        console.log(IERC20(lpAddress).balanceOf(msg.sender));

        IERC20(lpAddress).transferFrom(user, address(this), totalSupply / 1e4);
        
        //Send GMB tokens from the user to the gamblingContract
        IERC20(gmbTokenContract).transferFrom(msg.sender, address(this), gmbToken);

        games[currentRound].isParticipated[user] = true;
        games[currentRound].participants.push(ParticipationData(user, gmbToken, betValue));
    }

    function _generate_random_number() private view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.gaslimit + uint256(blockhash(block.number)) +
        ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
        block.number)));

        return 20;
        // return (seed - ((seed / maxRandomNumber) * maxRandomNumber));
    }

    function jackpotValue() public view returns (uint) {
        uint sumOfGMBTokens = 0;
        for (uint i = 0; i < games[currentRound].participants.length; i++) {
            sumOfGMBTokens += games[currentRound].participants[i].gmbToken;
        }
        return sumOfGMBTokens;
    }

    function _newCoverage() view private returns (uint) {
        uint sumOfGMBTokens = jackpotValue();
        return maxRandomNumber / 4 / sumOfGMBTokens;
    }

    function correctGuess(uint betValue, uint winnerInterval, uint randomNumber, uint _maxRandomNumber)
      public pure returns(bool){
        bool negativeOverflow = randomNumber < winnerInterval;
        bool positiveOverflow = randomNumber + winnerInterval > _maxRandomNumber;
        bool correctGuess = false;
        if(negativeOverflow) {
            uint overflowValue = winnerInterval - randomNumber;
            correctGuess =  (betValue > (_maxRandomNumber - overflowValue) && betValue <= _maxRandomNumber) || 
                        (betValue >= 0 && betValue < (randomNumber + winnerInterval));

        } else if (positiveOverflow) {
            uint overflowValue = randomNumber + winnerInterval - _maxRandomNumber;
            correctGuess =  (betValue > (randomNumber - winnerInterval) && betValue <= _maxRandomNumber)  || 
                        (betValue >= 0 && betValue < (overflowValue));
        } else {
            correctGuess = betValue > (randomNumber - winnerInterval) && betValue < (randomNumber + winnerInterval);
        }
        return correctGuess;
    }

    //TODO: decide on maxRandomNumber and initialInterval
    function _determine_winners(uint256 randomNumber) private {
        uint _coveragePerGMB = games[currentRound - 1].coveragePerGMB;
        uint userInterval;
        for (uint i = 0; i < games[currentRound].participants.length; i++) {
            uint betValue = games[currentRound].participants[i].betValue;
            address accountAddr = games[currentRound].participants[i].addr;
            userInterval = _coveragePerGMB * games[currentRound].participants[i].gmbToken;
            if (correctGuess(betValue, userInterval, randomNumber, maxRandomNumber)) {
                games[currentRound].winners.push(WinnerData(accountAddr, false));
            }
        }
        games[currentRound].coveragePerGMB = _newCoverage();
    }

    function isWinner(uint index, address _addr) view public returns (bool, uint) {
        for (uint i = 0; i < games[index].winners.length; i++) {
            if (games[index].winners[i].addr == _addr) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function _newGame() internal {
        currentRound += 1;
        games[currentRound].valid = true;
        //TODO emit log
    }

    function _endGame(uint randomNumber) private {
        games[currentRound].randomNumber = randomNumber;

        _determine_winners(randomNumber);

        uint jackpotValue = jackpotValue();
        uint tokensToBurn = jackpotValue / JackpotBurnPortion;
        if (games[currentRound].winners.length > 0) {
            games[currentRound].winnerShare =  (jackpotValue - tokensToBurn) / games[currentRound].winners.length;
        }
        IGMBToken(gmbTokenContract).burn(tokensToBurn);
        games[currentRound].finished = true;
    }

    function endGame() public onlyAdmin {
        require(games[currentRound].participants.length > 0, "There is no participant");

        uint256 randomNumber = _generate_random_number();
        _endGame(randomNumber);
        _newGame();
    }

    function emergencyEnd(uint _rand) public onlyAdmin {
        _endGame(_rand);
        _newGame();
    }

    function claim(uint gameNumber) public returns (bool) {
        bool ret;
        uint index;
        (ret, index) = isWinner(gameNumber, msg.sender);
        require(ret == true, "You didn't win, You cannot claim GMB token");
        require(games[gameNumber].winners[index].claimed == false, "You can claim only once");
        IERC20(gmbTokenContract).transfer(msg.sender, games[gameNumber].winnerShare);
        games[gameNumber].winners[index].claimed = true;
        return true;
    }
}