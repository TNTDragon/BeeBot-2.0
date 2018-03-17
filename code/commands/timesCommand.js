//Converts seconds into a time stamp
function deathRunTime(valu) {
    var temp = "Map not played";
    if (valu != "N/A") {
        temp = Math.floor(valu/60) + ":" + Math.floor((valu % 60)/10) + "" + (valu%10);
    } return temp;
};
//Converts miliseconds into a timestamp
function gravityTime(valu) {
    var temp = "Map not played";
    if (valu != "N/A") {
        var minutes = "";
        if ((valu/60000)>1) {
            minutes = Math.floor(valu/60000);
        }
        var seconds = "";
        if ((valu/10000) > 1) {
            seconds += Math.floor((valu % 60000)/10000);
        }
        seconds += Math.floor((valu%10000)/1000);
        var miliseconds = "";
        if ((valu%1000)/100 < 1) {
            miliseconds += "0";
            if ((valu%100)/10 < 1) {
                miliseconds += "0";
            }
        }
        miliseconds += (valu % 1000);
        temp = minutes + ":" + seconds + "." + miliseconds + " seconds\n";
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

    Please not that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Showcases record times for Death Run and Gravity Maps",
    usage: "-times {Game} {Player} <Page>",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
		//In case the user forgets to specify a player
        if (args[0] == undefined) {
            if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete(config.settings.messageRemovalDelay);}
            message.reply("The proper usage of this command is `-times [DeathRun/Gravity] {PLAYER} <PAGE>`").then(msg => checkDM(msg, message.channel.type));
        } else {
		/*  The DeathRun and Gravity code is completely independent
		If you	want, you can remove one or the other
		And simply have -times [Player] in your server
		That will only return one of the gamemodes.
		You will need to replace all the occurrences
		of args[1] with args[0] and args[2] with args[1]
		*/
        if ((args[0].toLowerCase()=="deathrun")||(args[0].toLowerCase()=="dr")) {
            req("http://api.hivemc.com/v1/game/dr/maps", function (error, response, body) {
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                if (error){logging.legacyLog("URGENT HTTP ERROR")}
                var hiveData = JSON.parse(body);
                req("http://api.hivemc.com/v1/player/" + args[1] + "/DR", function (error, response, body) {
                    if (error){logging.legacyLog("URGENT HTTP ERROR")}
                    var hivePlayerData = JSON.parse(body);
					//proceeds with the command if the user is found in the API
                    if (hivePlayerData.UUID) {
					//Creates an object with map names and
					//their appropriate times (or N/A)
                    var playertimes = Object.keys(hiveData).map(function(e) {
                        var time = "N/A";
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
					//Deciding what page to show the user
					//By default each page has 10 entries
					var pageEntries = 10;
                    if (args[2] == undefined || isNaN(args[2])) {
                        var listPage = 1;
                    } else if (args[2] > Math.ceil(playertimes.length/pageEntries)) {
                        var listPage = Math.ceil(playertimes.length/pageEntries);
                    } else {
                        var listPage = parseInt(args[2]);
                    }
					/*  Creates the records list
					The following sequence will order all the data into a
					coherent list of records as requested per player,
					and clean up after itself when done
					*/
                    var messageList = "";
                    for (i=(listPage*pageEntries-pageEntries); i<listPage*pageEntries && i<playertimes.length; i++) {
                        messageList += "• **" + playertimes[i][1] + "** - " + deathRunTime(playertimes[i][0]) + "\n";
                    }
                    messageList += "*Showing page " + listPage + " out of " + Math.ceil(playertimes.length/pageEntries) + "*\n";
                    if (listPage<Math.ceil(playertimes.length/pageEntries)) {
                        messageList += "\nUse `-times DeathRun " + args[1] + " " + (listPage+1) + "` for the next page.";
                    }
                    message.reply("",
                        {
                            embed: embed("Death Run Records for `" + args[1] + "`",
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
        } else if ((args[0].toLowerCase()=="gravity")||(args[0].toLowerCase()=="grav")) {
             req("http://api.hivemc.com/v1/game/grav/maps", function (error, response, body) {
                if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
                if (error){logging.legacyLog("URGENT HTTP ERROR")}
                var hiveData = JSON.parse(body);
                req("http://api.hivemc.com/v1/player/" + args[1] + "/grav", function (error2, response2, body2) {
                    if (error2){logging.legacyLog("URGENT HTTP ERROR")}
                    var hivePlayerData = JSON.parse(body2);
					//proceeds with the command if the user is found in the API
                    if (hivePlayerData.UUID) {
					//Creates an object with all the maps
					//and sorts it alphabetically
                    var allMaps = Object.keys(hiveData).map(function(e) {
                        return [hiveData[e].mapname.toLowerCase()]
                    }).sort(function(a,b){
                        if(a[1] < b[1]) return -1;
                        if(a[1] > b[1]) return 1;
                        return 0;
                    });
					/*  To clear out any confussion
					Gravity map names differ tremendously
					between Player API and Map API. 
					The following code aims to minimize the differences
					While maximazing name accuracy.
					*/
                    var playerMapTimes = {};
                    var actualMapNames = {};
                    Object.keys(hivePlayerData.maprecords).map(function(e) {
                        var simplifiedMapName = "";
                        var mapNameArray = e.toLowerCase().split("_");
                        var realesqeMapName = "";
                        mapNameArray.forEach(function(z,zz){
                            realesqeMapName += mapNameArray[zz].charAt(0).toUpperCase() + mapNameArray[zz].substring(1) + " ";
                            simplifiedMapName += mapNameArray[zz].toLowerCase();
                        });
                    playerMapTimes[simplifiedMapName]=hivePlayerData.maprecords[e];
                    actualMapNames[simplifiedMapName]=realesqeMapName;
					});
					var playertimes = [[]];
					allMaps.forEach(function(e,z) {
                        var playerTime = "N/A";
                        if (playerMapTimes[e] != undefined) {
                            playerTime = playerMapTimes[e];
                        }
                        var finalMapName = "Map";
                        if (actualMapNames[e] == undefined) {
                            finalMapName = e[0].charAt(0).toUpperCase() + e[0].substring(1);
                        } else {
                            finalMapName = actualMapNames[e];
                        }
                        playertimes[z] = [playerTime, finalMapName];
                    });
                    playertimes.sort(function(a,b){
                        if(a[1] < b[1]) return -1;
                        if(a[1] > b[1]) return 1;
                        return 0;
                    });
				//Deciding what page to show the user
				//By default each page has 10 entries
				var pageEntries = 10;
                if (args[2] == undefined || isNaN(args[2])) {
                    var listPage = 1;
                } else if (args[2] > Math.ceil(playertimes.length/pageEntries)) {
                    var listPage = Math.ceil(playertimes.length/pageEntries);
                } else {
                    var listPage = parseInt(args[2]);
                }
				/*  Creates the records list
				The following sequence will order all the data into a
				coherent list of records as requested per player,
				and clean up after itself when done
				*/
                var messageList = "";
                for (i=(listPage*pageEntries-pageEntries); i<listPage*pageEntries && i<playertimes.length; i++) {
                    messageList += "• **" + playertimes[i][1] + "** - " + gravityTime(playertimes[i][0]);
                }
                messageList += "*Showing page " + listPage + " out of " + Math.ceil(playertimes.length/pageEntries) + "*\n";
                if (listPage<Math.ceil(playertimes.length/pageEntries)) {
                    messageList += "\nUse `-times Gravity " + args[1] + " " + (listPage+1) + "` for the next page.";
                }
                message.reply("",
                    {
                        embed: embed("Gravity Records for `" + args[1] + "`",
                        messageList, "gold")
                    }    
                ).then(msg => checkDM(msg, message.channel.type));
                }else{
                    message.reply("",
                    {
                        embed: embed("Error",
                            "An error occured.\mMaybe you misspelled the player's name?", "red")
                    }).then(msg => checkDM(msg, message.channel.type));
                }
                });
            });
        }
        }
    }
};