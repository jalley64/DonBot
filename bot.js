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
var _livingPlayers = [];
var _yetToVote = [];
var _playerRoles = {};
var _deadPlayers = [];
var _isGame = false;
var _startDate = new Date();
var _wolves = [];
var _seer = "";
var _angel = "";
var _vigilante = "";
var _gameDay = 0;
var _angelTarget = "";
var _seerTarget = "";
var _wolfTarget = "";
var _vigTarget = "";
var _channelId = "";
var _isDay = true;
var _signupsStarted = false;
var _playercount = 13;
//whenever adding to this list, add to end game reset
var _fullVoteHistory = {"<@640718554785906694>": [ "1" ,"2","3","4","5"]};
var _activeVoteHistory = {"<@640718554785906694>": [ "1" ,"2","3","4","5"]};
var _voteTallyPostIds = [];
var _majority = 0;
var _seerhistory = [];
var _angelHistory = [];
var _vigHistory = [];
var _wolfHistory = [];
var _isSeerDead = false;
var _isAngelDead = false;
var _isVigDead = false;
var _doesVigHaveBullet = false;


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
        if (message.startsWith("!startsignups")){
            longMessage = message;
            message = "!startsignups";
        }

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
            else if (message.startsWith("!lookup")){
                msg.reply("You must provide a user to lookup");
                return;
            }
        }

        switch(message.toLowerCase()) {
            // !signup
            case '!signup':
               signUpUser(userID, msg);
               break;
            case '!cancelsignup':
               cancelSignUp(userID, msg);
               break;
            case '!rollcall': //modonly
                msg.reply(printPlayers(msg, true));
                break;  
            case '!startsignups':
                tryStartSignups(msg, longMessage);
                break;
            case '!startgame':
                startGame(msg);
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
            case '!lookup':
                seerLookup(msg, userID);
                break;
            case '!protect':
                angelProtect(msg, userID);
                break;
            case '!shoot':
                vigShot(msg, userID);
                break;
            case '!eat':
                wolfNom(msg, userID);
                break;
            case '!hold':
                holdVigShot(msg);
                break;
         }
     }
  });

function seerLookup(msg, nickname){
    //check for pm 
    if (msg.channel.type != "dm"){
        msg.reply("Only the seer can use this command in a DM with the Don.");
        return;
    }

    var authorID = "<@" + msg.author.id + ">";
    if(_playerRoles[authorID] != "Seer"){
        msg.reply("Only the seer can use this command.");
        return;
    }
    
    if(_isSeerDead){
        msg.reply("The seer is dead. No using this command!");
        return;
    }

    if(_seerTarget != ""){
        msg.reply("You have already used this command tonight.");
        return;
    }

    if(!_livingPlayers.some(x => x.Username == nickname)){
        msg.reply("The is not a valid living player, please try again.");
    }
    else{
        var seerCandidate = _livingPlayers.find(x => x.Username == nickname).UserID;
        if (seerCandidate == _seer){
            msg.reply("You cannot lookup yourself. Clown.");
            return;
        }

        _seerTarget = seerCandidate;
        _seerhistory.push(_seerTarget);
        msg.reply("You have looked up: " + nickname + "\nThe result of your lookup is: " + _playerRoles[_seerTarget]);
    }

    if (isNightComplete(msg)){
        endNight();
    }

    return;
}

function holdVigShot(msg){
    _doesVigHaveBullet = true;
    _vigTarget = "";
    isNightComplete(msg);
}

function angelProtect(msg, nickname){
    //check for pm 
    if (msg.channel.type != "dm"){
        msg.reply("Only the angel can use this command in a DM with the Don.");
        return;
    }

    var authorID = "<@" + msg.author.id + ">";
    if(_playerRoles[authorID] != "Angel"){
        msg.reply("Only the angel can use this command.");
        return;
    }

    if(_isAngelDead){
        msg.reply("The angel is dead. No using this command!");
        return;
    }

    
    if(_angelTarget != ""){
        msg.reply("You have already used this command tonight.");
        return;
    }

    if(!_livingPlayers.some(x => x.Username == nickname)){
        msg.reply("The is not a valid living player, please try again.");
    }
    else{
        _angelTarget = _livingPlayers.find(x => x.Username == nickname).UserID;
        _angelHistory.push(_angelTarget);
        msg.reply("You have protected: " + nickname + ".");
    }

    if (isNightComplete(msg)){
        endNight();
    }

    return;
}


function vigShot(msg, nickname){
    //check for pm 
    if (msg.channel.type != "dm"){
        msg.reply("Only the vig can use this command in a DM with the Don.");
        return;
    }

    if(!_doesVigHaveBullet){
        msg.reply("The vig does not have a bullet tonight");
        return;
    }
    
    if(_isVigDead){
        msg.reply("The vig is dead. No using this command!");
        return;
    }
    
    if(_vigTarget != ""){
        msg.reply("You have already used this command tonight.");
        return;
    }
    
    var authorID = "<@" + msg.author.id + ">";
    if(_playerRoles[authorID] != "Vigilante"){
        msg.reply("Only the vig can use this command.");
        return;
    }

    if(!_doesVigHaveBullet){
        msg.reply("You do not have a shot tonight");
        return;
    }

    if(!_livingPlayers.some(x => x.Username == nickname)){
        msg.reply("The is not a valid living player, please try again.");
    }
    else{
        var vigCandidate = _livingPlayers.find(x => x.Username == nickname).UserID;
        if (vigCandidate == authorID){
            msg.reply("You cannot shoot yourself");
            return;
        }

        _vigTarget = vigCandidate;
        _vigHistory.push(_vigTarget);
        msg.reply("You have shot: " + nickname + ".");
    }

    if (isNightComplete(msg)){
        endNight();
    }

    return;
}

function wolfNom(msg, nickname){
    //check for pm 
    if (msg.channel.type != "dm"){
        msg.reply("Only the selected wolf can use this command in a DM with the Don.");
        return;
    }

    var authorID = "<@" + msg.author.id + ">";
    if(_wolves[0] != authorID){
        msg.reply("Only the selected wolf can use this command.");
        return;
    }
    
    if(_wolfTarget != ""){
        msg.reply("You have already used this command tonight.");
        return;
    }

    if(!_livingPlayers.some(x => x.Username == nickname)){
        msg.reply("The is not a valid living player, please try again.");
    }
    else{
        var nomCandidate = _livingPlayers.find(x => x.Username == nickname).UserID;
        if (_wolves.includes(nomCandidate)){
            msg.reply("You cannot eat yourself (or your teammates).");
            return;
        }

        _wolfTarget = nomCandidate;
        _wolfHistory.push(_wolfTarget);
        msg.reply("You have eaten: " + nickname + ".");
    }

    if (isNightComplete(msg)){
        endNight();
    }

    return;
}

function endNight(){
    var nightStr = "**Night " + _gameDay + "**\n\n";
    if (_doesVigHaveBullet){
        if (_vigTarget != ""){
            _doesVigHaveBullet = false;
        }

        if (_angelTarget == _vigTarget){
            nightStr += "The **angel** has stepped in and prevented the vig from landing a kill. Oof.\n\m";
        }
        else{
            var role = killPlayer(_vigTarget);
            if (didVillageWin() || didWolvesWin()){
                nightStr += endGame();
            }
            else{
                var roleArticle = role == "Villager" || role == "Wolf" ? "a" : "the";
                nightStr += "The vig has taken a shot. " + _vigTarget + " was " + roleArticle + "  **" + role + "**.";
            }
        }
    }
        
    if(_angelTarget == _wolfTarget){
        nightStr += "The **angel** has saved the day. Preventing the filthy wolf attack.";
    }
    else
    {
        if (_wolfTarget != _vigTarget)
        {
            var roleArticle = role == "Villager" || role == "Wolf" ? "a" : "the";
            var role = killPlayer(_wolfTarget);
            nightStr += "The wolves have taken their prey. " + _wolfTarget + " was " + roleArticle + "  **" + role + "**.";
            if (didWolvesWin()){
                nightStr += endGame();
            }
        }
        else{
            nightStr += "The wolves tried to kill someone who was already dead.";
        }
    }

    nightStr += "\n";
    var msg = client.channels.get(_channelId).send(nightStr);
    nextDay(msg);
}

function applyVote(msg, userID){
    if (!_livingPlayers.some(x => x.UserID == userID)){
        msg.reply("He's not playing fuckface. Don't waste my time.");
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
    if (didVillageWin()){
        //print gameover message
    }
    else if (didWolvesWin()){
        
    }
    else{
        endDayStr += "\nSpecials have 24 hours to get me their action.";
        if (_gameDay % 2 == 0)
        {
            _doesVigHaveBullet = true;
        }
        
        if ( _doesVigHaveBullet && !_isVigDead){
            endDayStr += "\nThe Vig has a shot tonight.";
        }
        else if (!_isVigDead){
            endDayStr += "\nThe vig does not have a bullet tonight.";
        }
        
        pmSpecials();
        msg.reply(endDayStr);
    }
}

function killPlayer(userID) {
    var role = _playerRoles[userID];
    _livingPlayers = _livingPlayers.filter(x => x.UserID != userID);
    _deadPlayers.push(userID);
    checkForSpecialDeath(userID);
    return role;
}

function didVillageWin(){
    
    if(_wolves.length == 0){
        return true;
    }

    return false;
}

function didWolvesWin(){
    return false;
    var majority = _livingPlayers.length / 2;
    if(_wolves.length >= majority){
        return true;
    }

    return false;
}

function pmSpecials(){
    if (!_isSeerDead){
        var seerPmStr = GameStrings.GetSeerActionMessage(_livingPlayers.map(a => a.Username));
        client.users.get(cleanKey(_seer)).send(seerPmStr);
    }

    if (!_isVigDead){
        var vigPmStr = GameStrings.GetVigilanteActionMessage(_livingPlayers.map(a => a.Username), _doesVigHaveBullet);
        client.users.get(cleanKey(_vigilante)).send(vigPmStr);
    }

    if (!_isAngelDead){
        var angelPmStr = GameStrings.GetAngelActionMessage(_livingPlayers.map(a => a.Username));
        client.users.get(cleanKey(_angel)).send(angelPmStr);
    }

    var wolfPmStr = GameStrings.GetWolfActionMessage(_livingPlayers.map(a => a.Username));
    client.users.get(cleanKey(_wolves[0])).send(wolfPmStr);
}

function checkForSpecialDeath(userID){
    var role = _playerRoles[userID];
    if (role == "Seer"){
        _isSeerDead = true;
        return;
    }
    else if (role == "Vigilante"){
        _isVigDead = true;
        return;
    } 
    else if (role == "Angel"){
        _isAngelDead = true;
    }
    else if (role == "Wolf"){
        _wolves.splice(_wolves.indexOf(userID), 1);
    }

    return;
}

function isNightComplete(msg){
    if(_doesVigHaveBullet && !_isVigDead){
        if (_vigTarget == "")
        {
            return false;
        }
    }
    
    if(!_isAngelDead && _angelTarget == ""){
        return false;
    }
    
    if(!_isSeerDead && _seerTarget == ""){
        return false;
    }
    
    if (_wolfTarget == ""){
        return false;
    }

    return true;
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

function resetSpecialTargets() {
    _angelTarget = "";
    _seerTarget = "";
    _wolfTarget = "";
    _vigTarget = "";
}

function createAndPinVoteTally(msg){
    msg.reply("Day " + _gameDay + " Vote Tally").then(sent => { // 'sent' is that message you just sent
        _voteTallyPostIds.push(sent.id);    
        sent.pin();
});
}

function cleanKey(userID){
    return userID.substr(2, userID.length - 3);    
}

function pmRoles(){
    for (var key in _playerRoles){
        var cleanedKey = cleanKey(key); 
        var body = ""
        switch (_playerRoles[key]){
            case "Seer":
                body = GameStrings.GetSeerRoleMessage();
                break;
            case "Angel":
                body = GameStrings.GetAngelRoleMessage();
                break;
            case "Vigilante":
                body = GameStrings.GetVigilanteRoleMessage();
                break;
            case "Wolf":
                body = GameStrings.GetWolfRoleMessage();
                break;
            case "Villager":
                body = GameStrings.GetVillagerRoleMessage();
                break;
        }

        client.users.get(cleanedKey).send(body);
    }
}

function generateRoles(){
    var seerIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _seer = _signedUpUsers[seerIndex].UserID;
    _playerRoles[_seer] = "Seer";
    _signedUpUsers.splice(seerIndex,1);
    
    var angelIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _angel = _signedUpUsers[angelIndex].UserID;
    _playerRoles[_angel] = "Angel";
    _signedUpUsers.splice(angelIndex,1);
    
    var vigIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _vigilante = _signedUpUsers[vigIndex].UserID;
    _playerRoles[_vigilante] = "Vigilante";
    _signedUpUsers.splice(vigIndex,1);

    for (var i = 0; i < 3; i++){
        var wolfIndex = getRandomInt(0, _signedUpUsers.length - 1);
        var wolf = _signedUpUsers[wolfIndex];
        _wolves.push(wolf.UserID);
        _playerRoles[wolf.UserID] = "Wolf";
        _signedUpUsers.splice(wolfIndex,1);
    }

    _signedUpUsers.forEach(function(user){
        _playerRoles[user.UserID] = "Villager";
    }); 

    _signedUpUsers = Array.from(_livingPlayers);
}

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tryStartSignups(msg, longMessage){
    _channelId = msg.channel.id;

    if (_signupsStarted || _isGame){
        msg.reply("Unable to start a game right now. Please use the !endgame command to reset signups.");
        return;
    }

    var msgParts = longMessage.split(" ");
    if (msgParts.length > 1){
        _playercount = msgParts[1];
    }
    else{
        _playercount = 13;
    }
    
    _signupsStarted = true;
    msg.reply("Aight lets do dis. Dont disappoint me.")
}//modonly

function cancelSignUp(userID, msg){
    if (!_signupsStarted){
        msg.reply("Signups aint open yet fuck face!");
        return;
    }
    
    if (!_signedUpUsers.some(e => e.UserID === userID)){
        msg.reply("Ya aint even signed up ya filthy animal.")
    }
    else{
        var originalLength = _signedUpUsers.length;
        _signedUpUsers = _signedUpUsers.filter(x => x.UserID != userID);
        var newlength = _signedUpUsers.length;
        if(newlength < originalLength){
          msg.reply("Boo. Fine. We removed ya. Now get outta my face, see.");
        }
        else{
          msg.reply("He aint even signed up to play. CLAMPS!.");
        }
    }
}

function endGame(msg){
    resetVariables();
    unPinLastGameMessages(msg.channel);
    var message = msg.reply("The games ova. Now start another one ya jabroni.");
}//modonly

function resetVariables(){
    _signedUpUsers = [];
    _livingPlayers = [];
    _yetToVote = [];
    _playerRoles = {};
    _deadPlayers = [];
    _isGame = false;
    _startDate = new Date();
    _wolves = [];
    _seer = "";
    _angel = "";
    _vigilante = "";
    _gameDay = 0;
    _angelTarget = "";
    _seerTarget = "";
    _wolfTarget = "";
    _vigTarget = "";
    _channelId = "";
    _isDay = true;
    _signupsStarted = false;
    _playercount = 13;
    //whenever adding to this list, add to end game reset
    _fullVoteHistory = {};
    _activeVoteHistory = {};
    _voteTallyPostIds = [];
    _majority = 0;
    _seerhistory = [];
    _angelHistory = [];
    _vigHistory = [];
    _wolfHistory = [];
    _isSeerDead = false;
    _isAngelDead = false;
    _isVigDead = false;
    _doesVigHaveBullet = false;
}

function unPinLastGameMessages(channel){
    channel.fetchPinnedMessages().then(function(resp){
        resp.forEach(element => {
            ///TODO: add protection for rules to not get unpinned
            element.unpin();
        });
    });
}

function signUpUser(userID, msg){
    if (!_signupsStarted){
        msg.reply("Signups aint open yet fuck face!");
        return;
    }

    var user = client.fetchUser(cleanKey(userID)).then(function(user){
        if (_signedUpUsers.some(e => e.UserID === userID)){
            msg.reply("Yo dipshit, you did this already!");
        }
        else{
            if (_signedUpUsers.length < _playercount)
            {
                _signedUpUsers.push({UserID: userID, Username: user.username});
                msg.reply("Congrats! " + userID + " is signed up to play werewolf. I will send out PMs when the game is set to begin");
            }
            else{
                msg.reply("We are at capacity fella, navigate yourself outta my face.");
            }
        }
    });
}//modonly

function printPlayers(isLiving){
    var playerString = "";
    if(_signupsStarted){
        if (_isGame){
            if (isLiving){
                playerString = "\n**Current Living Players**\n"
                _livingPlayers.forEach(function(element){
                    playerString += element.UserID + "\n";
                });        
            }
            else{
                playerString = "\n**Current Dead Players**\n"
                _deadPlayers.forEach(function(element){
                    playerString += element;
                    playerString += " - **" +_playerRoles[element] + "**";
                    playerString += "\n";
                });
            }
        }
        else{
            playerString = "**Current Signed Up Players**\n"
            _signedUpUsers.forEach(function(element){
                playerString += element.UserID + "\n";
            });
        }
    }
    else{
        playerString = "Signups aint started yet boss man!";
    }

    return playerString;
}

  
client.login(auth.token);
