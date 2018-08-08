//Function to convert the UnIx Timestamp into a proper date format
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    switch (date%10) {
        case 1:
        var dateEnd = "st";
        break;
        case 2:
        var dateEnd = "nd";
        break;
        case 3:
        var dateEnd = "rd";
        break;
        default:
        var dateEnd = "th";
        break;
    }
    if (Math.floor(date/10)==1) {dateEnd = "th";}
    var hour = a.getHours();
    var min = a.getMinutes();
    if (min<10) {
        min = "0" + min;
    }
    var time = date + dateEnd + " of " + month + ", " + year + " at " + hour + ":" + min;
    return time;
}
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

    Please note that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Provides information about the requested player",
    usage: "-player {Player}",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        //Remove the message if it's in a public channel
        if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
        //In case user forgets to specify the player
        if (args[0]==undefined) {
            if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete(config.settings.messageRemovalDelay);}
            message.reply("The proper usage for the command is:\n" +
            "`-player {Player}`\n" +
            "*`{Player}` can be either the IGN or the UUID of a player*").then(msg => checkDM(msg, message.channel.type));
        }else{
            req("http://api.hivemc.com/v1/player/" + args[0], function (error, response, body) {
                if (error){logging.legacyLog("URGENT HTTP ERROR")}
                //The command first checks if the website finds the player
                if (!(String(body).includes("Sorry, the page you are looking for could not be found"))){
                    var hiveData = JSON.parse(body);
                    //Default String value assumes that the player is online
                    var color = "green";
					var onlineCheck = "";
                    //If player is offline, the above values are changed appropriately
                    if (hiveData.status.description == "Currently hibernating in") {
                        color = "gray";
						onlineCheck = hiveData.username + "` was last seen on the " + timeConverter(hiveData.lastLogout)
                    }
                    message.reply("",
                    {
                        embed: embed(hiveData.username + " is " + hiveData.status.description.toLowerCase() + " " + hiveData.status.game,
                            "**Rank**: " + hiveData.modernRank.human +
                            "\n**Tokens**: " + hiveData.tokens +
                            "\n**Lucky Crates Owned**: " + hiveData.crates +
                            "\n**Golden Medals Collected**: " + hiveData.medals +
                            "\n`" + hiveData.username + "` has " + Object.keys(hiveData.achievements).length + " Global Achievements and " + hiveData.trophies.length + " trophies" +
                            "\n`" + hiveData.username + "` has first joined on the " + timeConverter(hiveData.firstLogin) +
							"\n`" + onlineCheck, color, "https://crafatar.com/avatars/" + hiveData.UUID + "?overlay", "https://hivemc.com/player/" + hiveData.username)
                    }).then(msg => checkDM(msg, message.channel.type));
                //If the player is not found, error will pop up
                }else{
                        message.reply("",
                            {
                                embed: embed("Error",
                                    "An error occured. Maybe you misspelled the player's name?", "red")
                             }).then(msg => checkDM(msg, message.channel.type));
                }
            });
        }
    }
};