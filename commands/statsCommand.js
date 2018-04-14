//Calculator of Time Alive in Hide and Seek
//It's very basic and not too accurate, but
//it somewhat counteracts the broken API
function hideTimeAlive(hiveData) {
    var temp = "";
    //First, check if the time stat is correct
    if (Math.abs(hiveData.timealive)<13302000) {
        temp = "\'s time alive is: " + Math.floor(hiveData.timealive/86400) + " d. " + Math.floor((hiveData.timealive%86400)/3600) + " h, " + Math.floor((hiveData.timealive%3600)/60) + " min and " + Math.floor(hiveData.timealive%60) + " s";
    } else {
    //If users stats are glitched, this will attempt to
    //reverse the process. It's nowhere close perfectiong,
    //but with the unpredictable bug it's best that can be done.
        var newTimeAlive;
        newTimeAlive = hiveData.total_points - 30*hiveData.seekerkills - 50*hiveData.victories;
        //Now check if the new value is positive, and somewhat reasonable
        if (newTimeAlive>0 && newTimeAlive<4320000) {
            temp = "\'s time alive is ≈" + Math.floor(newTimeAlive/86400) + " days and " + Math.floor((newTimeAlive%86400)/3600) + " hours\n*This time has been estimated and may not be fully accurate*";
        } else {
        //If nothing else works
            temp = "*\'s time alive is glitched :(*";
        }
    }
    return temp;
}
//checkDM will delete the bots message if it's not sent via a DM.
//Default interval is 30000 miliseconds
function checkDM(msg, DM) {
    if (DM != "dm" && config.settings.messageRemovalDelay > 0) {
        msg.delete(config.settings.messageRemovalDelay);
    }
};
/*  Information on the command as a whole
As you may see, this command is mostly hardcoded to work properly.
This is partially due to it being the very first command, but more
importantly, I feel that doing the command individually for each
gamemode allows ease of customizability.

If you have any code knowledge, you can easily add whatever you
please to the format. However I'd like to suggest you post on
the forum page, or message me on Discord what you'd like to add.
This way, if it's something reasonable, such as a K/D in a specific
game or such, I can add it in for everyone.
*/
module.exports = {
    /* Command Information
    ===============================================================
    If you'd wish to change the description of a command,
    or where it can be executed, here is where you do that.

    By default all commands have "All" channels allowed,
    to limit it put channel ID's within "" and separate by commas.
    Example:
    allowedChannels: ["321251232131","1579213910451"],

    Please not that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Provides statistics for a specified user on the Hive.\nFor list of available Main Game Codes, type \"-stats list\" \nFor list of available Arcade Game Codes, type \"-stats arcade\"",
    usage: "-stats {Game Code} {Player}",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        if (args[0]==undefined) {
            if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete(config.settings.messageRemovalDelay);}
            message.reply("The proper usage for the command is: " +
            "\n-stats {Game Code} {Players}"+
            "\nFor list of available Main Game Codes, type \"-stats list\""+
            "\nFor list of available Arcade Game Codes, type \"-stats arcade\"").then(msg => checkDM(msg, message.channel.type));
        }else{
        switch (args[0].toLowerCase()) {
            case "gnt":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/GNT", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("SkyGiants stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Gold Earned:** " + hiveData.gold_earned +
                                    "\n**Beasts Slain:** " + hiveData.beasts_slain +
                                    "\n**Shutdowns:** " + hiveData.shutdowns + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "gntm":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/GNTM", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error) {
                        logging.legacyLog("URGENT HTTP ERROR")
                    }
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID) {
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("SkyGiants: Mini Stats of " + args[1],
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills +
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Gold Earned:** " + hiveData.gold_earned +
                                    "\n**Beasts Slain:** " + hiveData.beasts_slain +
                                    "\n**Shutdowns:** " + hiveData.shutdowns + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    } else {
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "spl":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SPL", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
						//The following few lines will grab the K/D of a player on each
						//of the characters, granted the player played at least one game
						//as the character. Rounded to two decimal places.
                        var raven = hiveData.character_stats.RavenCharacter ? "\n**Raven:** " + (Math.round(100*(hiveData.character_stats.RavenCharacter.kills/hiveData.character_stats.RavenCharacter.deaths))/100) : "";
                        var oinky = hiveData.character_stats.OinkyCharacter ? "\n**Oinky:** " + (Math.round(100*(hiveData.character_stats.OinkyCharacter.kills/hiveData.character_stats.OinkyCharacter.deaths))/100) : "";
                        var booster = hiveData.character_stats.BoosterCharacter ? "\n**Booster:** " + (Math.round(100*(hiveData.character_stats.BoosterCharacter.kills/hiveData.character_stats.BoosterCharacter.deaths))/100) : "";
                        var torstein = hiveData.character_stats.TorsteinCharacter ? "\n**Torstein:** " + (Math.round(100*(hiveData.character_stats.TorsteinCharacter.kills/hiveData.character_stats.TorsteinCharacter.deaths))/100) : "";
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Sploop stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Blocks Painted:** " + hiveData.blocks_painted +
                                    "\n**Ultimates Earned:** " + hiveData.ultimates_earned +
                                    "\n**Characters K/D Ratios:** " +
                                    oinky +
                                    raven +
                                    booster +
                                    torstein + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "draw":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/DRAW", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("DrawIt stats of " + args[1],
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Correct Guesses:** " + hiveData.correct_guesses +
                                    "\n**Incorrect Guesses:** " + hiveData.incorrect_guesses +
                                    "\n**Total Guesses:** " + (hiveData.correct_guesses+hiveData.incorrect_guesses) +
                                    "\n**Skips:** " + hiveData.skips + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "bp":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BP", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Block Party stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Placings:** " + hiveData.total_placing +
                                    "\n**Elimiations:** " + hiveData.total_eliminations + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "sky":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SKY", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
						//Represents the time alive of a player in a more readable format
                        var timeAlive = "\n`" + args[1] + "`\'s time alive is: " + Math.floor(hiveData.timealive/86400) + " d. " + Math.floor((hiveData.timealive%86400)/3600) + " h, " + Math.floor((hiveData.timealive%3600)/60) + " min and " + Math.floor(hiveData.timealive%60) + " s";
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Sky Wars stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Most Points:** " + hiveData.most_points +
                                    timeAlive + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "slap":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SLAP", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Slaparoo stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Slap-Offs:** " + hiveData.kills +
                                    "\n**Deaths:** " + hiveData.deaths + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "timv":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/TIMV", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Trouble in Mineville stats of `" + args[1] + "`",
                                    "**Karma:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Role Points:** " + hiveData.role_points +
                                    "\n**Most Karma:** " + hiveData.most_points +
                                    "\n**Traitor Points:** " + hiveData.t_points+
                                    "\n**Innocent Points:** " + hiveData.i_points +
                                    "\n**Detective Points:** " + hiveData.d_points + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "mimv":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/MIMV", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Murder in Mineville stats of `" + args[1] + "`",
                                    "**Karma:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Games played:** " + hiveData.games_played +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "hide":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/HIDE", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Hide and Seek stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Hiders Killed:** " + hiveData.seekerkills +
                                    "\n**Seekers Killed:** " + hiveData.hiderkills +
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n`" + args[1] + "`" + hideTimeAlive(hiveData) + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "dr":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/DR", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("DeathRun stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Checkpoints:** " + hiveData.totalcheckpoints + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "grav":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/GRAV", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
						//In case this looks like little information,
						//this is literally all that the API provides
                        message.reply("",
                            {
                                embed: embed("Gravity stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "cai":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/CAI", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Cowboys and Indians stats of " + args[1],
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Leaders Caught:** " + hiveData.catches +
                                    "\n**Leaders Captured:** " + hiveData.captures +
                                    "\n**Times Caught:** " + hiveData.caught +
                                    "\n**Times Captured:** " + hiveData.captured + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "ef":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/EF", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Electric Floor stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Players Outlived:** " + hiveData.outlived+
                                    "\n**Blocks Activated:** " + hiveData.blocksactivated + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "sp":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SP", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
						//Represents the time alive of a player in a more readable format
                        var timeAlive = "\n`" + args[1] + "`\'s time alive is: " + Math.floor(hiveData.timealive/86400) + " d. " + Math.floor((hiveData.timealive%86400)/3600) + " h, " + Math.floor((hiveData.timealive%3600)/60) + " min and " + Math.floor(hiveData.timealive%60) + " s";
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Splegg stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Eggs Fired:** " + hiveData.eggsfired +
                                    "\n**Blocks Destroyed:** " + hiveData.blocksdestroyed +
                                    "\n**Deaths:** " + hiveData.deaths +
                                    timeAlive + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "rr":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/RR", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Restaurant Rush stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Tables Cleared:** " + hiveData.tablescleared +
                                    "\n**Highscore:** " + hiveData.highscore + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "oitc":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/OITC", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("One in The Chamber stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Arrows Fired:** " + hiveData.arrowsfired + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "mm":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/MM", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Music Masters stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Incorrect Notes:** " + hiveData.incorrectnotes +
                                    "\n**Correct Notes:** " + hiveData.correctnotes +
                                    "\n**Perfect Notes:** " + hiveData.notes_perfect +
                                    "\n**Good Notes:** " + hiveData.notes_good + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "cr":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/CR", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Cranked stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Cat Uses:** " + hiveData.rccat_count +
                                    "\n**Cat Kills:** " + hiveData.rccat_kills +
                                    "\n**Air Strike Uses:** " + hiveData.airstrike_count +
                                    "\n**Air Strike Kills:** " + hiveData.airstrike_kills +
                                    "\n**Sonic Squid Uses:** " + hiveData.sonicsquid_count +
                                    "\n**Sonic Squid Kills:** " + hiveData.sonicsquid_kills + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "hb":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/HB", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
						//In case this looks like little information,
						//this is literally all that the API provides
                        message.reply("",
                            {
                                embed: embed("The Herobrine stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points + " (" + hiveData.title + ")" +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Shards Captured:** " + hiveData.captures + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "bd":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BD", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Battery Dash stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.batteries_charged +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Energy Collected:** " + hiveData.energy_collected + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "lab":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/LAB", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
						//In case this looks like little information,
						//this is only information aside of game victories,
						//which say number of wins in each microgame
                        message.reply("",
                            {
                                embed: embed("The Lab stats of `" + args[1] + "`",
                                    "**Atoms:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "sg":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SG", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
						//Represents the time alive of a player in a more readable format
                        var timeAlive = "\n`" + args[1] + "`\'s time alive is: " + Math.floor(hiveData.timealive/86400) + " d. " + Math.floor((hiveData.timealive%86400)/3600) + " h, " + Math.floor((hiveData.timealive%3600)/60) + " min and " + Math.floor(hiveData.timealive%60) + " s";
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Survival Games stats of `" +args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Most Points:** " + hiveData.most_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Deathmatches:** " + hiveData.deathmatches +
                                    "\n**Crates Opened:** " + hiveData.cratesopened +
                                    timeAlive + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "hero":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/HERO", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("SG: Heroes stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**One vs One Wins:** " + hiveData.one_vs_ones_wins +
                                    "\n**Deathmatches:** " + hiveData.deathmatches +
                                    "\n**Crates Opened:** " + hiveData.crates_opened + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "sgn":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SGN", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Survival Games 2.0 stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Most Points:** " + hiveData.most_points +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Deathmatches:** " + hiveData.deathmatches +
                                    "\n**Crates Opened:** " + hiveData.crates_opened + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "bed":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BED", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Bed Wars stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "pmk":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/PMK", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("PuMpKiNfEcTiOn stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Infections:** " + hiveData.infections+
                                    "\n**Kills:** " + hiveData.kills + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
               break;
            case "surv":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/SURV", function (error, response, body) {
                    //In case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Survive The Night stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points + " (" + hiveData.title + ")" +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills +
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Generators Powered:** " + hiveData.generators_powered +
                                    "\n**Looted Crates:** " + hiveData.looted_crates + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "ee":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/EE", function (error, response, body) {
                    //in case Hive's API has issues
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    //Grab all the information from the API,
                    //and put it into hiveData Object
                    var hiveData = JSON.parse(body);
                    if (hiveData.UUID){
                        //This bit here adds a link to the Community Hub Discord,
                        //feel free to disable it in the settings if you want.
                        var advertisement = ""
                        if (config.settings.advertisement) {advertisement="\n\n[ᶜˡᶦᶜᵏ ᵐᵉ](https://discord.gg/q4mAbPK) ᵗᵒ ᶜʰᵉᶜᵏ ᵒᵘᵗ ᵗʰᵉ ᴴᶦᵛᵉ ᶜᵒᵐᵐᵘⁿᶦᵗʸ ʰᵘᵇ"}
                        message.reply("",
                            {
                                embed: embed("Exploding Eggs stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.gamesplayed +
                                    "\n**Leaps:** " + hiveData.leaps, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type, divN));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type, divN));
                        }
                    });
                break;
            case "arcade":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                message.reply("",
                    {
                            embed: embed("HiveMC Stats Help",
                            "Arcade game codes:\n" +
                            " • Battery Dash - BD\n" +
                            " • Cranked - CR\n" +
                            " • Draw It - DRAW\n" +
                            " • Electric Floor - EF\n" +
                            " • Music Masters - MM\n" +
                            " • One in The Chamber - OITC\n" +
                            " • Restaurant Rush - RR\n" +
                            " • Slaparoo - SLAP\n" +
                            " • Splegg - SP\n" +
                            " • Sploop - SPL\n" +
                            " • Survival Games: Heroes - HERO\n" +
                            " • The Herobrine - HB\n" +
                            "\nUsage: `-stats {GAME-CODE} {PLAYERNAME}`", "blue")
                    }).then(msg => checkDM(msg, message.channel.type));
                break;
            default:
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                message.reply("",
                    {
                        embed: embed("HiveMC Stats Help",
                            "Available Gamemodes: \n" +
                            " • Block Party - BP\n" +
                            " • Bed Wars - BED\n" +
                            " • Cowboys and Indians - CAI\n" +
                            " • DeathRun - DR\n" +
                            " • Gravity - GRAV\n" +
                            " • Hide and Seek - HIDE\n" +
                            " • Murder in Mineville - MIMV\n" +
                            " • PuMpKiNfEcTiOn - PMK\n" +
                            " • SkyGiants - GNT\n" +
                            " • SkyGiants: Mini - GNTM\n" +
                            " • Sky Wars - SKY\n" +
                            " • Survival Games - SG\n" +
                            " • Survival Games 2.0 - SGN\n" +
                            " • The Lab - LAB\n" +
                            " • Trouble in Mineville - TIMV\n" +
                            "For Arcade game codes use `-stats Arcade`\n" +
                            "\nUsage: -stats {GAME-CODE} {PLAYERNAME}", "blue")
                    }).then(msg => checkDM(msg, message.channel.type));
                break;
        }
    }
    }
};
