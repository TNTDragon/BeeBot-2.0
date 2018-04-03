//Our own system for counting block levels,
//Works exactly as the in-game one
function blockLevel(xp, detail) {
    var level = 1;
    //50 XP is removed due to a bug(?) in the system
    var exp = xp-50;
    while((exp-level*50) >= 0) {
        exp = exp-level*50;
        level++
	}
    //If the player requested a more detailed list,
    //this will provide progress bars for each block.
    var progressBar = "";
    if (detail) {
        //number of bars in detailed answer
        var bars = 10;
        //number of bars that are 'filled'
        var leftoverXP = Math.floor(bars*exp/(level*50))
        //In case player reached level cap,
        //This will make sure their bar is full
        if (level == 30) {leftoverXP = 10}
        var end = bars-leftoverXP;
        for (; leftoverXP > 0; leftoverXP--) {
            progressBar += "▮";
        }
        for (; end > 0; end--) {
            progressBar += "▯";
        }

        if (level == 30) {
            progressBar +=  "`  *Max Level*";
        }else{
            progressBar += "`  *" + exp + "/" + (level*50) + "*";
        }
    }
    //Creates the final output
    temp = "Level " + level;
    //and adds the progress bar if the user requested one
    if (detail) {temp+= "\n  `" + progressBar}
    return temp;
};
//checkDM will delete the bots message if it's not sent via a DM.
//Default interval is 30000 miliseconds
function checkDM(msg, DM) {
    if (DM != "dm" && config.settings.messageRemovalDelay > 0) {
        msg.delete(config.settings.messageRemovalDelay);
    }
};
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
    description: "Lists all block levels from Hide and Seek.",
    usage: "-levels {Player} <Page> [-d]",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        //In case the user forgets to specify a player
        if (args[0] == undefined) {
            if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete(config.settings.messageRemovalDelay);}
            message.reply("The proper usage of this command is `-levels {PLAYER} <PAGE> [-d]`").then(msg => checkDM(msg, message.channel.type));
        } else {
		req("http://api.hivemc.com/v1/player/" + args[0] + "/HIDE", function (error, response, body) {
            if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
            if (error){logging.legacyLog("URGENT HTTP ERROR")}
            var hiveData = JSON.parse(body);
            //proceeds with the command if the user is found in the API
            if (hiveData.UUID) {
            //If the player didn't ask for more detail, by default they're given a simple list
            var detailValue = false;
            if ((args[1] == "detail" || args[1] == "-d") || (args[2] == "detail" || args[2] == "-d")) {detailValue = true;}
            //Creates an object of all the blocks using the list in the config file
            var playerLevels = Object.keys(config.blocks).map(function(e) {
                //If the player didn't use a block, it will set their 'level' to this
                var temp = "Block not used";
                if (hiveData.rawBlockExperience[e] != undefined) {
                    temp = blockLevel(hiveData.rawBlockExperience[e], detailValue);
                }
                return [config.blocks[e], temp];
            //This will sort the list alphabetically
            }).sort(function(a,b){
            if(a[0] < b[0]) return -1;
            if(a[0] > b[0]) return 1;
            return 0;
            });
            /*  Deciding what page to show to the user
            By default the command shows 10 entries, however
            with detailsed mode each entry is twice as long,
            hence the amount of pages is doubled
            */
            var pageCount = 10;
            if (detailValue) {pageCount = 5}
            if (args[1] == undefined || isNaN(args[1])) {
                var listPage = 1;
            } else if (args[1] > Math.ceil(playerLevels.length/pageCount)) {
                var listPage = Math.ceil(playerLevels.length/pageCount);
            } else {
                var listPage = parseInt(args[1]);
            }
            /*  Creates the levels list
            The following sequence will order all the data into a
            coherent list of levels as requested per player,
            and clean up after itself when done
            */
            var messageList = "";
            var nextPage = ""
            if (detailValue) {nextPage = " -d"}
            for (i=(listPage*pageCount-pageCount); i<listPage*pageCount && i<playerLevels.length; i++) {
                messageList += "• **" + playerLevels[i][0] + "** - " + playerLevels[i][1] + "\n";
            }
            messageList += "*Showing page " + listPage + " out of " + Math.ceil(playerLevels.length/pageCount) + "*\n";
            if (listPage<Math.ceil(playerLevels.length/pageCount)) {
                messageList += "\nUse `-levels " + args[0] + " " + (listPage+1) + nextPage + "` for the next page.";
            }
            message.reply("",
                {
                    embed: embed("Hide and Seek Block Levels for " + args[0],
                    messageList, "gold")
                }
            ).then(msg => checkDM(msg, message.channel.type));
            }else{
                message.reply("",
                    {
                        embed: embed("Error",
                        "An error occured.\nMaybe you misspelled the player's name?", "red")
                    }).then(msg => checkDM(msg, message.channel.type));
            }
		    });
        }
    }
};