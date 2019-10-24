const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
var _signedUpUsers = [];
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
var roles= {};



// still need to add these above to end game
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
    var message = msg.content;
    var userID = msg.author;
    var longMessage = "";
    if (message.substring(0, 1) == '!') {
        if (message.startsWith("!startsignups")){
            longMessage = message;
            message = "!startsignups";
        }

        if (message.startsWith("!cancelSignup") || message.startsWith("!singup")){ //add mod check and logic to prevent other users from removing people
            var msgParts = longMessage.split(" ");
            if (msgParts.length > 1){
                userID = msgParts[1];
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
                msg.reply(_playercount);
                break;  
            case '!startsignups':
                tryStartSignups(msg, longMessage);
                break;
            //this one is for debuging
            case '!playercount':
                msg.reply(_playercount);
                break;
            case '!endgame':
                endGame(msg);
                break;
            break;
         }
     }
  });

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
    if (!_signedUpUsers.includes(userID)){
        msg.reply("Ya aint even signed up ya filthy animal.")
    }
    else{
        var index = _signedUpUsers.indexOf(userID);
        if(index > -1){
          _signedUpUsers.splice(index, 1);  
          msg.reply("Boo. Fine. We removed ya. Now get outta myface, see.");
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
        msg.reply("Yo dipshit, you did this already!" + userID);
    }
    else{
        if (_signedUpUsers.length < _playercount)
        {
            _signedUpUsers.push(userID);
            msg.reply("Congrats! You are signed up to play werewolf. I will PM you when the game is set to begin");
        }
        else{
            msg.reply("We are at capacity fella, navigate yourself outta my face.");
        }
    }
}//modonly

function printPlayers(msg){

}

  
client.login(auth.token);