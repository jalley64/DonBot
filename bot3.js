var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var signedUpUsers = [];
var isGame = false;
var startDate = new Date();
var wolves = [];
var seer = "";
var angel = "";
var vigilante = "";

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
 });
 bot.on('ready', function (evt) {
     logger.info('Connected');
     logger.info('Logged in as: ');
     logger.info(bot.username + ' - (' + bot.id + ')');
 });

 bot.on('message', function (user, userID, channelID, message, evt) {

    bot.sendMessage({
        to:channelID,
        message: "boo"
    });
    //add check for mafia channel

    //add check for PM 

    //
     // Our bot needs to know if it will execute a command
     // It will listen for messages that will start with `!`
     if (message.substring(0, 1) == '!') {
         var args = message.substring(1).split(' ');
         var cmd = args[0].toLowerCase();
        
         args = args.splice(1);
         switch(cmd) {
             // !signup
             case 'signup':
                // signupUser(user, userID, channelID, this);
             break;
             // Just add any case commands if you want to..
          }
      }
 });
 
