//Calculator of Time Alive in Hide and Seek
//It may seem basic, but it's elaborate,
//and it works fairly well so hooray!
function hideTimeAlive(hiveData) {
    var temp = "";
    //First, check if the time stat is correct
    //The number it checks has to be big, so it is
    //set to almost 8* more than highest I could find
    if (hiveData.timealive<9936000 && hiveData.timealive>0) {
        //If the data falls within the ]0,9936000[ range,
        //a simple information is displayed.
        temp = "\'s time alive is: " + Math.floor(hiveData.timealive/86400) + " d. " + Math.floor((hiveData.timealive%86400)/3600) + " h, " + Math.floor((hiveData.timealive%3600)/60) + " min and " + Math.floor(hiveData.timealive%60) + " s";
    } else {
        /* In case the user stats are glitched
        This will somewhat accurately estimate the time alive of someone affected by the glitch
        The system comes within a consistent 2 (or less) hour accuracy range for most test players

        How it works:
         Basically, it attempts to estimate how many points the player has earned from staying alive,
        by subtracting all other factors that were at play. A small issue is that the point system
        has considerably changed over the years, hence the estimations.

        Explanation:
         maxTimeAlive is the absolute highest timeAlive a person could have without some sort of a bug.
            It takes your total points and takes away 20 points per seeker kill and 10 points per hider kill
            This was the lowest pointage I could find for all actions, as wins used to not give points for hiders
         minTimeAlive  is the absolute lowest timeAlive a person can get, period. It can be negative at times
            It takes your total points, and takes away 30 per seeker kill, 10 per hider kill, 50 per win,
            as well as 50 points per game played, which is an estimated number of points gotten from taunting
            (there is 300 seconds to taunt, with 1/4pps gives 75, which is rounded to 50 since people will
            seek in some games, die before their hider game ends, or simply not use the taunts perfectly)
         statisticalConstant
            This is a constant gotten from averaging over 900 users' ratio of maxTimeAlive to minTimeAlive,
            and looking at where their actual timeAlive falls in-between the two.

        The Loop:
         There is a for loop in the code which goes through multiples of the statisticalConstant in it's equation.
        That's there due to small statistical chance that a player wil still be in the negative timeAlive region after
        estimating their timeAlive. It's around a 2% chance within a single iteration, less than 0.5% with second, and even
        lower with the third one. Doing a fourth iteration would be wrong, as 4*statisticalConstant > 1, hence why if the
        newTimeAlive is still <0 after the loop is over, it is simply set to maxTimeAlive which, by definition, has to be
        positive, and if it truly required that, it means it's most likely fairly low in comparison to minTimeAlive
        */
        var newTimeAlive,maxTimeAlive,minTimeAlive;
        maxTimeAlive = (hiveData.total_points - 20*hiveData.seekerkills - 10*hiveData.hiderkills)*2 + hiveData.gamesplayed/2;
        minTimeAlive = (hiveData.total_points - 30*hiveData.seekerkills - 10*hiveData.hiderkills - 50*hiveData.victories - 50*hiveData.gamesplayed)*2 + hiveData.gamesplayed/2;
        newTimeAlive = 0;
        var statisticalConstant = 0.2968633091;
        for (i=1;i<4;i++) {
            if (((maxTimeAlive-minTimeAlive)*i*statisticalConstant + minTimeAlive)>0) {
                newTimeAlive = (maxTimeAlive-minTimeAlive)*i*statisticalConstant + minTimeAlive;
                i=4;
            }
        }
        if (newTimeAlive<=0) {
            newTimeAlive = maxTimeAlive;
        }
        //Since this is an estimated time, it is displayed with a one hour accuracy
        temp = "\'s time alive is ≈" + Math.floor(newTimeAlive/86400) + " days and " + Math.floor((newTimeAlive%86400)/3600) + " hours\n*This time has been estimated and may not be fully accurate*";
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

    Please note that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Provides statistics for a specified user on the Hive.\nFor list of available Main Game Codes, type \"-stats list\" \nFor list of available Arcade Game Codes, type \"-stats arcade\"",
    usage: "-stats {Game Code} {Player}",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        if (args[0]==undefined || args[1]==undefined) {
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "\n\n**Characters K/D Ratios:** " +
                                    oinky +
                                    raven +
                                    booster +
                                    torstein + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "\n\n`" + args[1] + "`" + hideTimeAlive(hiveData) + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                embed: embed("Total Bed Wars stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated +
                                    "\n**Current Win Streak:** " + hiveData.win_streak + advertisement +
                                    "`*`\n\n**This Win Streak takes into consideration games in all BW modes.*", "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                    }
                });
                break;
            case "beds":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BEDS", function (error, response, body) {
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
                                embed: embed("Bed Wars: Solos stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated +
                                    "\n**Current Win Streak:** " + hiveData.win_streak + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
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
            case "bedd":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BEDD", function (error, response, body) {
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
                                embed: embed("Bed Wars: Duos stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated +
                                    "\n**Current Win Streak:** " + hiveData.win_streak + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
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
            case "bedt":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BEDT", function (error, response, body) {
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
                                embed: embed("Bed Wars: Teams stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated +
                                    "\n**Current Win Streak:** " + hiveData.win_streak + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
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
            case "bedx":
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                req("http://api.hivemc.com/v1/player/" + args[1] + "/BEDX", function (error, response, body) {
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
                                embed: embed("Bed Wars: Double Fun stats of `" + args[1] + "`",
                                    "**Points:** " + hiveData.total_points +
                                    "\n**Victories:** " + hiveData.victories +
                                    "\n**Games Played:** " + hiveData.games_played +
                                    "\n**Kills:** " + hiveData.kills+
                                    "\n**Deaths:** " + hiveData.deaths +
                                    "\n**Beds Destroyed:** " + hiveData.beds_destroyed +
                                    "\n**Team Eliminations:** " + hiveData.teams_eliminated +
                                    "\n**Current Win Streak:** " + hiveData.win_streak + advertisement, "gold","https://crafatar.com/renders/body/"+ hiveData.UUID.toString() +"?overlay", "https://hivemc.com/player/" + args[1])
                             }).then(msg => checkDM(msg, message.channel.type));
                    }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                                    "An error occurred.\nMaybe you misspelled the player's name?", "red")
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
                            " • Bed Wars - BED`*`\n" +
                            " • Cowboys and Indians - CAI\n" +
                            " • DeathRun - DR\n" +
                            " • Exploding Eggs - EE\n" +
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
                            "\nUsage: `-stats {Game Code} {Player}`" +
                            "\n\n**For stats on each BW mode add S, D, T or X; at the end, to get stats for Solos, Duos, Teams and Double Fun respectively. (ex. BEDX)*", "blue")
                    }).then(msg => checkDM(msg, message.channel.type));
                break;
        }
    }
    }
};
