const GameStrings = require("./GameStrings");

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
var _signedUpUsers = ["<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>","<@250667798076850177>"];
var _livingPlayers = [];
var _playerRoles = {};
var _deadPlayers = [];
var _isGame = false;
var _startDate = new Date();
var _wolves = [];
var _seer = "";
var _angel = "";
var _vigilante = "";
var _isDay = true;
var _signupsStarted = false;
var _playercount = 13;
//whenever adding to this list, add to end game reset
var _votehistory = {};
var _daycount;


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

        if (message.startsWith("!cancelsignup") || message.startsWith("!lynch") || message.startsWith("!signup")){ //add mod check and logic to prevent other users from removing people
            var msgParts = message.split(" ");
            if (msgParts.length > 1){
                userID = msgParts[1];
                message = msgParts[0];
            }
            else if (message.startsWith("!lynch")){
                msg.reply("You must specify a player to lynch.");
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
                printPlayers(msg);
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
            case '!lynch':
                applyVote(msg);
                break;
         }
     }
  });

function applyVote(msg){

}

function startGame(msg){
    //todo: add check to make sure signups have been opened and that the player count has been met
    if (_isGame){
        msg.reply("We're already playing fuck face.");
    }
    else{
        //print game is starting
        _isGame = true;
        _livingPlayers = _signedUpUsers;
        
        //generate roles
        generateRoles();
        //send out pms
        pmRoles();
        //print rules
        var rules = GameStrings.GetDay1Rules(_signedUpUsers);
        msg. reply(rules);
        printPlayers(msg);
    }
}

function startDay(msg){

}

function pmRoles(){
    for (var key in _playerRoles){
        var cleanKey = key.substr(2, key.length - 3);    
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

        client.users.get(cleanKey).send(body);
    }
}

function generateRoles(){
    var seerIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _seer = _signedUpUsers[seerIndex];
    _playerRoles[_seer] = "Seer";
    _signedUpUsers.splice(seerIndex,1);
    
    var angelIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _angel = _signedUpUsers[angelIndex];
    _playerRoles[_angel] = "Angel";
    _signedUpUsers.splice(angelIndex,1);
    
    var vigIndex = getRandomInt(0, _signedUpUsers.length - 1);
    _vigilante = _signedUpUsers[vigIndex];
    _playerRoles[_vigilante] = "Vigilante";
    _signedUpUsers.splice(vigIndex,1);

    for (var i = 0; i < 1; i++){
        var wolfIndex = getRandomInt(0, _signedUpUsers.length - 1);
        var wolf = _signedUpUsers[wolfIndex];
        _wolves.push(wolf);
        _playerRoles[wolf] = "Wolf";
        _signedUpUsers.splice(wolfIndex,1);
    }

   /* _signedUpUsers.forEach(function(user){
        _playerRoles[user] = "Villager";
    }) */

    _signedUpUsers = _livingPlayers;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tryStartSignups(msg, longMessage){
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
    if (!_signedUpUsers.includes(userID)){
        msg.reply("Ya aint even signed up ya filthy animal.")
    }
    else{
        var index = _signedUpUsers.indexOf(userID);
        if(index > -1){
          _signedUpUsers.splice(index, 1);  
          msg.reply("Boo. Fine. We removed ya. Now get outta my face, see.");
        }
    }
}

function endGame(msg){
    _signedUpUsers = [];
    _isGame = false;
    _startDate = new Date();
    _wolves = [];
    _seer = "";
    _angel = "";
    _vigilante = "";
    _isDay = true;
    _signupsStarted = false;
    _playercount = 13;
    unPinLastGameMessages(msg.channel);
    msg.reply("The games ova. Now start another one ya jabroni.");
}//modonly

function unPinLastGameMessages(channel){
    var thisthing = channel.fetchPinnedMessages().then(function(resp){
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

    if (_signedUpUsers.includes(userID)){
        msg.reply("Yo dipshit, you did this already!");
    }
    else{
        if (_signedUpUsers.length < _playercount)
        {
            _signedUpUsers.push(userID);
            msg.reply("Congrats! " + userID + " is signed up to play werewolf. I will send out PMs when the game is set to begin");
        }
        else{
            msg.reply("We are at capacity fella, navigate yourself outta my face.");
        }
    }
}//modonly

function printPlayers(msg){
    var playerString = "";
    if(_signupsStarted){
        if (_isGame){
            playerString = "**Current Living Players**\n"
            _livingPlayers.forEach(function(element){
                playerString += element + "\n";
            });
        }
        else{
            playerString = "**Current Signed Up Players**\n"
            _signedUpUsers.forEach(function(element){
                playerString += element + "\n";
            });
        }
    }
    else{
        playerString = "Signups aint started yet boss man!";
    }

    msg.reply(playerString);
}

  
client.login(auth.token);
