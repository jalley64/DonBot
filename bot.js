const GameStrings = require("./GameStrings");

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
var _signedUpUsers = [ { UserID: '<@640717881402720277>', Username: 'testuser5' },
{ UserID: '<@250667798076850177>', Username: 'jacob' },
{ UserID: '<@640715566935572482>', Username: 'testuser2' },
{ UserID: '<@640716364042207242>', Username: 'testuser3' },
{ UserID: '<@640716950418358272>', Username: 'testuser4' },
{ UserID: '<@640718554785906694>', Username: 'testuser6' } ];
var _isGame = false;
var _gameDay = 0;
var _channelId = "";
var _playerCount = 0;
//whenever adding to this list, add to end game reset
var _fullVoteHistory = {"<@640718554785906694>": [ "1" ,"2","3","4","5"]};
var _activeVoteHistory = {"<@640718554785906694>": [ "1" ,"2","3","4","5"]};
var _voteTallyPostIds = [];
var _majority = 0; 


if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

// still need to add these above to end game
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
    var message = msg.content;
    var userID = "<@" + msg.author.id + ">";
    var longMessage = "";
    if (message.substring(0, 1) == '!') {
        if (message.startsWith("!cancelsignup") || message.startsWith("!vote") ||  message.startsWith("!eat") || message.startsWith("!shoot") || message.startsWith("!protect") || message.startsWith("!lookup") || message.startsWith("!signup")){ //add mod check and logic to prevent other users from removing people
            var msgParts = message.split(" ");
            if (msgParts.length > 1){
                userID = msgParts[1];
                message = msgParts[0];
            }
            else if (message.startsWith("!vote")){
                msg.reply("You must specify a player to lynch.");
                return;
            }
        }

        switch(message.toLowerCase()) {
            case '!startGame':
                startGame(msg);
                break;
            case '!startGame':
                startDay(msg);
                break;
            //this one is for debuging
            case '!playercount':
                msg.reply(_playercount);
                break;
            case '!endgame':
                endGame(msg);
                break;
            case '!vote':
                applyVote(msg, userID);
                break;
            case '!endGame':
                endGame(msg);
                break;
         }
     }
  });


function applyVote(msg, userID){
    if (!_livingPlayers.some(x => x.UserID == userID)){
        msg.reply("They're not playing fuckface. Don't waste my time.");
        return;
    }

    var authorID = "<@" + msg.author.id + ">";
    if (!_livingPlayers.some(x => x.UserID == authorID)){
        msg.reply("You're not playing fuckface. Don't waste my time.");
        return;
    }

    if (_yetToVote.includes(authorID)){
        _yetToVote.splice(_yetToVote.indexOf(authorID),1);
    }

    if(authorID in _voteTally){
        var formerTarget = _voteTally[authorID];
        if (formerTarget == userID){
            msg.reply ("You already voted for that user. Don't waste my time.");
            return;
        }

        var authorsActiveVoteIndex = _fullVoteHistory[formerTarget].indexOf(authorID);
        _fullVoteHistory[formerTarget][authorsActiveVoteIndex] = "(" + authorID + ")";

        authorsActiveVoteIndex = _activeVoteHistory[formerTarget].indexOf(authorID);
        _activeVoteHistory[formerTarget].splice(authorsActiveVoteIndex, 1);
    }

    _voteTally[authorID] = userID;
    if (!(userID in _fullVoteHistory)){
        _fullVoteHistory[userID] = [];
        _activeVoteHistory[userID] = [];
    }

    _fullVoteHistory[userID].push(authorID);
    _activeVoteHistory[userID].push(authorID);
    updateVoteTally(msg);
    var voteCount = _activeVoteHistory[userID].length;
    if ( voteCount >= _majority){
        //start 8 hour countdown

        //end day
        //todo: check and set "day end" flag in order to prevent the day from ending if more people vote past the majority threshhold.
        endDay(msg, userID);
    }
    else{
        var remainingVotes = _majority - voteCount;
        msg.reply("Got it. " + remainingVotes + " votes to send em to the gallows.");
    }
}

function endDay(msg, userID){
    var role = killPlayer(userID);
    var endDayStr = "**Day " + _gameDay + "**\n\n";
    endDayStr += "After much deliberation, the village has reached a verdict. Goodbye " + userID + ".\n";
    var roleArticle = role == "Villager" || role == "Wolf" ? "a" : "the";
    endDayStr += userID + " is " + roleArticle + "  **" + role + "**.\n";
    endDayStr += printPlayers(false);
    endDayStr += printPlayers(true);
    endDayStr += "\nPlease submit your night actions to the mod!.";
        msg.reply(endDayStr);
}

function getMajority(){
    return Math.floor(_playerCount / 2) + 1;
}


function updateVoteTally(msg){
    var id = _voteTallyPostIds.last();
    var voteStr = "Day " + _gameDay + " Vote Tally:\n";
    for (var element in _fullVoteHistory){
        voteStr += element + " - " + _activeVoteHistory[element].length + " - ";
        var history = _fullVoteHistory[element];
        _fullVoteHistory[element].forEach(function(vote){
            voteStr += vote + ", ";
        });

        voteStr = voteStr.slice(0, -2); 
        voteStr += "\n";
    }

    msg.channel.fetchMessage(id).then(message => {
        message.edit(voteStr);
    })
}

function startGame(msg){
    //todo: add check to make sure signups have been opened and that the player count has been met
    if (_isGame){
        msg.reply("We're already playing fuck face.");
    }
    else{
        //print game is starting
        _isGame = true;
        _livingPlayers = Array.from(_signedUpUsers);
        //generate roles
        generateRoles();    
        //send out pms
        pmRoles();
        //print rules
        var rules = GameStrings.GetDay1Rules(_signedUpUsers.length);
        msg. reply(rules);
        nextDay(msg);
    }
}

function nextDay(msg){
    _gameDay++;
    var dayString = "**Day " + _gameDay + " **\n";
    dayString += "\n" + printPlayers(false);
    dayString += "\n" + printPlayers(true);
    _majority = Math.floor((_livingPlayers.length / 2) + 1);
    dayString +="\nThe day phase is about to begin. There are " + _livingPlayers.length + " players. " + _majority + " votes needed for majority.";
    
    msg.reply(dayString).then(sent => {
        sent.pin();
    });;
    _yetToVote = _livingPlayers.map(a => a.userID);
    createAndPinVoteTally(msg);
    //start 24 hour timer
    _voteTally = {};
    resetSpecialTargets();
}

function createAndPinVoteTally(msg){
    msg.reply("Day " + _gameDay + " Vote Tally").then(sent => { // 'sent' is that message you just sent
        _voteTallyPostIds.push(sent.id);    
        sent.pin();
});
}

function printPlayers(isLiving){
    var playerString = "";
        if (_isGame){
            playerString = "\n**Current Living Players**\n"
                _livingPlayers.forEach(function(element){
                    playerString += element.UserID + "\n";
                });        
            }
  
    return playerString;
}

  
client.login(auth.token);
