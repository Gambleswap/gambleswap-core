// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

abstract contract IGambling {
  
    struct UserGameHistory {
        uint prize;
        uint jackpotValue;
        uint winnerNum;
        uint finalNumber;
        uint userBetValue;
        uint userGMB;
        bool isWon;
        bool claimed;
        bool participated;
    }

    function gmbTokenContract() view virtual external returns(address);
    function admin() view virtual external returns(address);
    function lending() view virtual external returns(address);
    function JackpotBurnPortion() view virtual external returns(uint);
    function FinalizerRewardPortion() view virtual external returns(uint);

    function QualificationThreshold() view virtual external returns(uint);
    function maxRandomNumber() view virtual external returns(uint);
    function initialInterval() view virtual external returns(uint);
    function currentRound() view virtual external returns(uint);
    function gameDuration() view virtual external returns(uint);
    function participated(uint roundNumber, address user) view virtual external returns (bool);

    function getCurrentRound() virtual public view returns(uint);

    function getCurrentRoundCoveragePerGMB() virtual public view returns(uint);

    function checkLPToken(address, address) virtual public view returns (bool);
    
    function participate(uint, uint, address, bool) virtual public;

    function getJackpotValue(uint) virtual public view returns (uint, uint);

    function correctGuess(uint betValue, uint winnerInterval, uint randomNumber, uint _maxRandomNumber)
      virtual public pure returns(bool);

    function isWinner(uint index, address _addr) virtual view public returns (bool, uint);

    function burning_game(uint i) virtual public pure returns (bool);

    function endGame() virtual public;

    function emergencyEnd(uint _rand) virtual public;

    function claimLP(uint gameNumber) virtual public;

    function claimPrize(uint gameNumber) virtual public;

    function getUserGameHistory(address user, uint roundNumber) public view virtual returns(UserGameHistory memory gameHistory);

    function setLending(address) public virtual;

    function getRecentGamesLPAmount(uint, address, address) external view virtual returns(uint);

}
