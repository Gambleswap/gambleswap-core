// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

abstract contract IGambling {


    function gmbTokenContract() view virtual external returns(address);
    function admin() view virtual external returns(address);
    function JackpotBurnPortion() view virtual external returns(uint);
    function QualificationThreshold() view virtual external returns(uint);
    function maxRandomNumber() view virtual external returns(uint);
    function initialInterval() view virtual external returns(uint);
    function currentRound() view virtual external returns(uint);
    function gameDuration() view virtual external returns(uint);

    function getCurrentRound() virtual public view returns(uint);

    function getCurrentRoundCoveragePerGMB() virtual public view returns(uint);

    function checkLPToken(address user) virtual public view returns (address);
    
    function participate(uint gmbToken, uint betValue) virtual public;

    function getJackpotValue(uint) virtual public view returns (uint);

    function correctGuess(uint betValue, uint winnerInterval, uint randomNumber, uint _maxRandomNumber)
      virtual public pure returns(bool);

    function isWinner(uint index, address _addr) virtual view public returns (bool, uint);

    function burning_game(uint i) virtual public pure returns (bool);

    function endGame() virtual public;

    function emergencyEnd(uint _rand) virtual public;

    function claimLP(uint gameNumber) virtual public;

    function claimPrize(uint gameNumber) virtual public;

    function getGameWinners(uint roundNumber) public view virtual returns(address[] memory);

    function getGameWinnerShare(uint roundNumber) public view virtual returns(uint);
}
