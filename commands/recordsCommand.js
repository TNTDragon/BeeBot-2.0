//Quick function that formats the data,
//depending on whether or not there is any
function dataFormatter(valu, type) {
    if (type == "-t") {
        var temp = "Map not completed";
    } else if (type == "-k"){
        var temp = "No kills recorded";
    } else {
        var temp = "No deaths found";
    }
    if (valu != "N/A") {
        if (type == "-t") {
            temp = Math.floor(valu/60) + ":" + Math.floor((valu % 60)/10) + "" + (valu%10);
        } else {
            temp = valu;
        }
    } return temp;
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

    Please note that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Showcases various records from DeathRun. By default shows lowest times for map completion, add `-d` or `-k` at the end to show total deaths or highest kills respectively for each map.",
    usage: "-records {Player} [Page] [-d|-k]",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        if (args[0]==undefined) {
            message.reply("The proper usage of this command is `-records {Player} [Page]`\nYou can add `-d` or `-k` at the end for different record lists").then(msg => checkDM(msg, message.channel.type));
        } else if (args[0] == "help") {
            message.reply("You can choose what type of records you would like to be shown by using *one* of the following:\n• `-d` - Shows you your total deaths on each map\n• `-k` - Shows you your record kills on each map (from playing as death)\n\nCommand usage: `-records {Player} [Page] [-t|-d|-k]`")
        } else {
            req("http://api.hivemc.com/v1/game/dr/maps", function (error, response, body) {
                if (message.channel.type != "dm") {message.delete();}
                if (error){logging.legacyLog("URGENT HTTP ERROR")}
                var hiveData = JSON.parse(body);
                req("http://api.hivemc.com/v1/player/" + args[0] + "/DR", function (error, response, body) {
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    var hivePlayerData = JSON.parse(body);
                    //proceeds with the command if the user is found in the API
                    if (hivePlayerData.UUID) {
                    //Creates an object with map names and
                    //whatever stat was requested
                        if (args[1] == "-k" || args[2] == "-k") {
                            //used to display the "next page" line at the end
                            var suffix = "-k";
                            //used for the title of the embed answer
                            var titleText = "DeathRun Kill Records";
                            //the actual array of kill records
                            var requestedArray = Object.keys(hiveData).map(function(e) {
                                var temp = "N/A";
                                if (hivePlayerData.mapkills[e] != undefined) {
                                    temp = hivePlayerData.mapkills[e];
                                }
                                return [temp, hiveData[e].mapname];
                             //This will sort the list alphabetically
                            }).sort(function(a,b){
                                if(a[1] < b[1]) return -1;
                                if(a[1] > b[1]) return 1;
                                return 0;
                            });
                        } else if (args[1] == "-d" || args[2] == "-d") {
                            //used to display the "next page" line at the end
                            var suffix = "-d";
                            //used for the title of the embed answer
                            var titleText = "DeathRun Map Deaths";
                            //the actual array of total deaths
                            var requestedArray = Object.keys(hiveData).map(function(e) {
                                var temp = "N/A";
                                if (hivePlayerData.mapdeaths[e] != undefined) {
                                    temp = hivePlayerData.mapdeaths[e];
                                }
                                return [temp, hiveData[e].mapname];
                            //This will sort the list alphabetically
                            }).sort(function(a,b){
                                if(a[1] < b[1]) return -1;
                                if(a[1] > b[1]) return 1;
                                return 0;
                            });
                        } else {
                            //used to display the "next page" line at the end
                            var suffix = "-t";
                            //used for the title of the embed answer
                            var titleText = "DeathRun Record Times";
                            //the actual array of quickest times
                            var requestedArray = Object.keys(hiveData).map(function(e) {
                                var temp = "N/A";
                                if (hivePlayerData.maprecords[e] != undefined) {
                                    temp = hivePlayerData.maprecords[e];
                                }
                                return [temp, hiveData[e].mapname];
                            //This will sort the list alphabetically
                            }).sort(function(a,b){
                                if(a[1] < b[1]) return -1;
                                if(a[1] > b[1]) return 1;
                                return 0;
                            });
                        }
                        //Deciding what page to show the user
                        //By default each page has 10 entries
					    var pageEntries = 10;
                        if (args[1] == undefined || isNaN(args[1])) {
                            var listPage = 1;
                        } else if (args[1] > Math.ceil(requestedArray.length/pageEntries)) {
                            var listPage = Math.ceil(requestedArray.length/pageEntries);
                        } else {
                            var listPage = parseInt(args[1]);
                        }
                        /*  Creates the records list
                        The following sequence will order all the data into a
                        coherent list of records as requested per player,
                        and clean up after itself when done
                        */
                        var messageList = "";
                        for (i=(listPage*pageEntries-pageEntries); i<listPage*pageEntries && i<requestedArray.length; i++) {
                            messageList += "• **" + requestedArray[i][1] + "** - " + dataFormatter(requestedArray[i][0], suffix) + "\n";
                        }
                        messageList += "*Showing page " + listPage + " out of " + Math.ceil(requestedArray.length/pageEntries) + "*\n";
                        if (listPage<Math.ceil(requestedArray.length/pageEntries)) {
                            messageList += "\nUse `-records " + args[0] + " " + (listPage+1) + " " + suffix + "` for the next page.";
                        }
                        message.reply("",
                            {
                                embed: embed(titleText + " for `" + args[0] + "`",
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
            });
        }
    }
};