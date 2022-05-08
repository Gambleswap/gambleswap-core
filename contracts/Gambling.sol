// SPDX-License-Identifier: MIT

import "./interfaces/IGMB.sol";
import "./interfaces/IGambling.sol";
import "./interfaces/IGambleswapERC20.sol";
import "./interfaces/IGambleswapLPLending.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import './libs/Math.sol';

pragma solidity ^0.8.3;

contract Gambling is IGambling{

    address public override gmbTokenContract;
    address public override admin;
    address public override lending;
    uint public override constant JackpotBurnPortion = 4;
    uint public override QualificationThreshold = 1;
    uint public override maxRandomNumber = 5000000000;
    uint public override initialInterval = 10;
    uint public override currentRound = 1;
    uint public override gameDuration = 2000;

    struct game{
        uint winnerShare;
        WinnerData[] winners;
        ParticipationData[] participants;
        mapping (address => bool) isParticipated;
        uint256 randomNumber;
        uint coveragePerGMB;
        bool finished;
        uint remainingFunds;
        bool valid;
    }

    struct ParticipationData {
        address addr;
        uint gmbToken;
        uint betValue;
        uint lpLockedAmount;
        address lpAddress;
        bool lpClaimed;
    }
    struct WinnerData {
        address addr;
        uint lpLockedAmount;
        address lpAddress;
        bool claimed;
    }

    mapping (uint=>game) games;


    function getCurrentRound() public override view returns(uint) {
        return currentRound;
    }

    function getCurrentRoundCoveragePerGMB() public override view returns(uint) {
        return games[currentRound - 1].coveragePerGMB / 1e12;
    }

    constructor(address GMBContractAddr) {
        gmbTokenContract = GMBContractAddr;
        admin = msg.sender;
        games[0].coveragePerGMB = 10 * 1e12;
    }

    modifier onlyAdmin {
        require(admin == msg.sender, "This is a restricted function for admin");
        _;
    }

    function checkLPToken(address user, address lpAddr) public override view returns (bool){
        for(uint256 i=0; i<IGMBToken(gmbTokenContract).getAuthorisedPoolsLength(); i++) {
            address authorizePoolAddr = IGMBToken(gmbTokenContract).authorisedPools(i);
            if (lpAddr != authorizePoolAddr) {
                continue;
            }
            uint256 userBalance = IERC20(authorizePoolAddr).balanceOf(user);
            uint256 totalSupply = IERC20(authorizePoolAddr).totalSupply();
            if (userBalance * 1e4 > totalSupply){
                return true;
            }
        }
        return false;
    }

    function participated(uint roundNumber, address user) public override view returns (bool){
        return games[roundNumber].isParticipated[user];
    }
    
    function participate(uint gmbToken, uint betValue, address choosenLpAddr, bool lend) public override {
        address user = msg.sender;
        require(gmbToken > 0, "GMB token must be more than zero");
        require(participated(currentRound , user) == false, 
                "You cannot participate in gambling more than once");
        require(IERC20(gmbTokenContract).balanceOf(msg.sender) >= gmbToken, 
                "You have insufficient GMB Token");
        uint lpLockedAmount = 0;
        if (lend) {
            IGambleswapLPLending(lending).borrow(msg.sender);
        }
        else {
            bool hasLP = checkLPToken(msg.sender, choosenLpAddr);
            require(hasLP == true, "Not enough LP token");
            uint totalSupply = IERC20(choosenLpAddr).totalSupply();
            lpLockedAmount = totalSupply / 1e4;

            IERC20(choosenLpAddr).transferFrom(user, address(this), lpLockedAmount);
        }
        //Send GMB tokens from the user to the gamblingContract
        IERC20(gmbTokenContract).transferFrom(msg.sender, address(this), gmbToken);

        games[currentRound].isParticipated[user] = true;
        games[currentRound].participants.push(ParticipationData(user, gmbToken, betValue, lpLockedAmount, choosenLpAddr, false));
    }

    function _generate_random_number() private view returns(uint256) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp + block.difficulty +
        ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
        block.gaslimit + uint256(blockhash(block.number)) +
        ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
        block.number)));

        return (seed - ((seed / maxRandomNumber) * maxRandomNumber));
    }

    function _newCoverage() view private returns (uint) {
        (uint sumOfGMBTokens,) = getJackpotValue(currentRound);
        return maxRandomNumber * 1e12 * 1e18 / 4 / sumOfGMBTokens;
    }

    function getJackpotValue(uint roundNumber) public override view returns (uint currentRoundVal, uint total) {
        currentRoundVal = 0;
        for (uint i = 0; i < games[roundNumber].participants.length; i++) {
            currentRoundVal += games[roundNumber].participants[i].gmbToken;
        }

        total = currentRoundVal;
        for (uint i = 1; i < 4 && roundNumber - i > 0; i++){
            uint funds = games[roundNumber - i].remainingFunds;
            if (games[roundNumber - i].winners.length == 0 && funds != 0)
                total += funds;
            else
                break;
        }
    }

    function correctGuess(uint betValue, uint winnerInterval, uint randomNumber, uint _maxRandomNumber)
      public override pure returns(bool){
        bool underflow = randomNumber < winnerInterval;
        bool positiveOverflow = randomNumber + winnerInterval > _maxRandomNumber;
        bool res = false;
        if(underflow) {
            uint overflowValue = winnerInterval - randomNumber;
            res =  (betValue > (_maxRandomNumber - overflowValue) && betValue <= _maxRandomNumber) || 
                        (betValue >= 0 && betValue < (randomNumber + winnerInterval));

        } else if (positiveOverflow) {
            uint overflowValue = randomNumber + winnerInterval - _maxRandomNumber;
            res =  (betValue > (randomNumber - winnerInterval) && betValue <= _maxRandomNumber)  || 
                        (betValue >= 0 && betValue < (overflowValue));
        } else {
            res = betValue > (randomNumber - winnerInterval) && betValue < (randomNumber + winnerInterval);
        }
        return res;
    }

    function getUserInterval(uint amount, uint coverage) public view returns (uint userInterval) {
        userInterval = Math.min(coverage * amount / 1e12 / 1e18,  maxRandomNumber / 4);
    }

    //TODO: decide on maxRandomNumber and initialInterval
    function _determine_winners(uint256 randomNumber) private {
        uint _coveragePerGMB = games[currentRound - 1].coveragePerGMB;
        for (uint i = 0; i < games[currentRound].participants.length; i++) {
            uint betValue = games[currentRound].participants[i].betValue;
            address accountAddr = games[currentRound].participants[i].addr;
            uint userInterval = getUserInterval(games[currentRound].participants[i].gmbToken, _coveragePerGMB);
            uint userLpLockedAmount = games[currentRound].participants[i].lpLockedAmount;
            address userLpAddress = games[currentRound].participants[i].lpAddress;
            if (correctGuess(betValue, userInterval, randomNumber, maxRandomNumber)) {
                games[currentRound].winners.push(WinnerData(accountAddr, userLpLockedAmount, userLpAddress, false));
            }
        }
    }

    function isWinner(uint index, address _addr) view override public returns (bool, uint) {
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

    function burning_game(uint i) public override pure returns (bool) {
        return i % 4 == 0;
    }

    function _endGame(uint randomNumber) private {
        games[currentRound].randomNumber = randomNumber;

        _determine_winners(randomNumber);
        games[currentRound].coveragePerGMB = _newCoverage();

        (uint jpValue, uint totalPrize) = getJackpotValue(currentRound);
        uint tokensToBurn = jpValue / JackpotBurnPortion;
        games[currentRound].remainingFunds = jpValue - tokensToBurn;
        console.log(burning_game(currentRound));
        if (games[currentRound].winners.length > 0) {
            games[currentRound].winnerShare =  (totalPrize - tokensToBurn) / games[currentRound].winners.length;
            games[currentRound].remainingFunds = 0;
        }
        else {
            if (burning_game(currentRound)) {
                uint sum = 0;
                for (uint j = 0; j < 4; j++){
                    if (currentRound < j)
                        break;
                    sum += games[currentRound - j].remainingFunds;
                    games[currentRound - j].remainingFunds = 0;
                }
                IGMBToken(gmbTokenContract).burn(sum);
            }
        }
        IGMBToken(gmbTokenContract).burn(tokensToBurn);
        games[currentRound].finished = true;

        IGambleswapLPLending(lending).refresh();
    }

    function endGame() public override onlyAdmin {
        require(games[currentRound].participants.length > 0, "There is no participant");

        uint256 randomNumber = _generate_random_number();
        _endGame(randomNumber);
        _newGame();
    }

    function emergencyEnd(uint _rand) public override onlyAdmin {
        _endGame(_rand);
        _newGame();
    }

    function getRecentGamesLPAmount(uint len, address user, address lp) public view override returns(uint amount) {
        amount = 0;
        for (uint gameNumber=currentRound; gameNumber >= 1 && gameNumber + len >= currentRound ; gameNumber-- ){
            for (uint i=0; i < games[gameNumber].participants.length; i++) {
                game storage g = games[gameNumber];
                if (g.participants[i].addr == user && g.participants[i].lpAddress == lp) {
                    amount += g.participants[i].lpLockedAmount;
                    break;
                }
            }
        }
    }

    function claimLP(uint gameNumber) public override {
        bool ret;
        (ret, ) = isWinner(gameNumber, msg.sender);
        require(!ret, "You won. Should use claimPrize instead");
        for (uint i=0; i < games[gameNumber].participants.length; i++) {
            if (games[gameNumber].participants[i].addr == msg.sender) {
                require(!games[gameNumber].participants[i].lpClaimed, "You already claimd your LP tokens.");
                address lp = games[gameNumber].participants[i].lpAddress;
                if ( lp != address(0))
                    IGambleswapERC20(lp).transfer(msg.sender, games[gameNumber].participants[i].lpLockedAmount);
                games[gameNumber].participants[i].lpClaimed = true;
                return;
            }
        }
        revert("You didn't participated in this round.");
    }

    function claimPrize(uint round) public override {
        bool ret;
        uint index;
        (ret, index) = isWinner(round, msg.sender);
        require(ret == true, "You didn't win, You cannot claim GMB token");
        require(games[round].winners[index].claimed == false, "You can claim only once");
        games[round].winners[index].claimed = true;
        IERC20(gmbTokenContract).transfer(msg.sender, games[round].winnerShare);
        address lp = games[round].winners[index].lpAddress;
        if (lp != address(0))
            IERC20(lp).transfer(msg.sender, games[round].winners[index].lpLockedAmount);
        // _forwardPreviousRoundsPrize(round, msg.sender);
    }

    function getUserGameHistory(address user, uint roundNumber) public view override returns(UserGameHistory memory gameHistory){
        // require(roundNumber < currentRound);
        bool isWon;
        uint index;
        (isWon, index) = isWinner(roundNumber, user);
        gameHistory.prize = isWon ? games[roundNumber].winnerShare : 0;
        gameHistory.claimed = isWon ? games[roundNumber].winners[index].claimed : false;
        gameHistory.isWon = isWon;
        (, gameHistory.jackpotValue) = getJackpotValue(roundNumber);
        gameHistory.winnerNum = games[roundNumber].winners.length;
        gameHistory.participated = games[roundNumber].isParticipated[user];
        gameHistory.finalNumber = games[roundNumber].randomNumber;
        ParticipationData memory participationData;
        for(uint i = 0; i < games[roundNumber].participants.length; i++) {
            if (games[roundNumber].participants[i].addr == user) {
                participationData = games[roundNumber].participants[i];
            }
        }
        gameHistory.userBetValue = participationData.betValue;
        gameHistory.userGMB = participationData.gmbToken;
        return gameHistory;
    }

    function setLending(address addr) onlyAdmin public override{
        lending = addr;
    }

    fallback() external payable {
        console.logBytes(msg.data);
    }
}