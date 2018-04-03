//import libraries

//config
config = require("./config.json");
//discord library
const dc = require("discord.js");
//web request library
req = require("request");
/* utility modules (self-written)
embed = rich embedding present in most commaandsd
filter = chat filter module
logging = logging module
*/
embed = require("./util/embed.js");
filter = require("./util/filter.js");
logging = require("./util/logging.js");

//Server-specific Config
secureConfig = require("./secureConfig.json");

//Loads all the available commands
const command = require("./commands/commands.js");

//creating discord client
bot = new dc.Client();

//list with tokens
list = new Map();

//Log to Console: Startup
console.log("Starting up...");

//Ready event
bot.on("ready", function () {
    //Log to Console: Startup done
    console.log("Discord ready, starting up done!");
    //Log to chat: Startup done
    logging.log("Bot started", "Discord link online,\nBeeBot up and running.", "blue");
});

//List of console functions to log any issues
bot.on("reconnecting", function () {
    console.log("Reconnecting to discord NOW.");
});
bot.on("warn", function (w) {
    console.log("WARNING: " + w);
});
bot.on("error", function (e) {
    console.log("Error: " + e);
});
bot.on("disconnect", function (cE) {
    console.log("Connection closed, this is more information: ");
    console.log(cE);
});

//Auto-message on join
bot.on('guildMemberAdd', function(member){
    member.sendMessage(config.welcome);
});

//The Following is main core of the bote and is executed on every message sent
bot.on("message", function (message) {
    //Exit if the message was sent by a bot or the user doesn't share server with the bot.
    if ((message.author.bot) || (bot.guilds.get(secureConfig.serverID).members.get(message.author.id) == undefined)) return;
	//Message filter - if enabled it removes messages that contain words from the "blocklist" in config.json
    if (config.settings.swearFilter && filter(message.content, "swearFilter") && message.channel.type != "dm" && !config.filter.exemptedChannels.includes(message.channel.id)){
        logging.log("Abusive Chat", "User: " + message.author.username + "\nMessage: " + message.content + "\nChannel: " + message.channel.name, "orange");
        message.delete();
        message.author.sendMessage("We just deleted one of your messages. Please stay appropriate. Further violation of the rules results in punishments!");
    }
	
    /*   Checks the message prefix (first character)
	====================================================================================
	By default BeeBot uses - or / for commands (For example "-say" or "/stats")
	You can add/remove the prefixes in the if() statement below, separating them with ||
	Example:
	if(starter == "~" || starter == "$")
	Will cause messages such as "$compare" or "~stats" be seen as the proper commands
    Do note that default command help will still show the - prefix
	====================================================================================
	*/
    var starter = message.content.substr(0, 1);
    if(starter == "-" || starter == "/") {
      message.content = message.content.substr(1);
      var msgParts = message.content.split(" ");
      var commandIdentifier = msgParts[0];
      msgParts.splice(0,1);
      var commands = Object.keys(command);
      if( (commands.includes(commandIdentifier)) && (((message.channel.type == "dm") && (command[commandIdentifier].allowedInDM) ) || (command[commandIdentifier].allowedChannels.includes(message.channel.id) || command[commandIdentifier].allowedChannels.includes("All")))){
          command[commandIdentifier].call(message, msgParts);
      }
    }

    else if (message.channel.type == "dm"){
        message.reply("Hello, " + message.author.username + ", I am your friendly BeeBot, what can I do for you today?\n" + config.settings.idleBotResponse);
    }
});

// login the bot, as soon as all events and functions are registered
bot.login(secureConfig.token);
