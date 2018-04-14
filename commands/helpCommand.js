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
    description: "Provides help for all usable BeeBot 2.0 commands",
    usage: "-help <Page>",
    allowedInDM: true,
    allowedChannels: ["All"],
    call: function(message, args){
        if (message.channel.type != "dm" && config.settings.commandRemoval) {message.delete();}
        //turning all available commands into an object
        const command = require("./commands.js");
        var channels = [];
        var commands = Object.keys(command).map(function(c) {
            var description = command[c].description;
            var usage = command[c].usage;
            var DMAllowance = command[c].allowedInDM;
            channels[c] = command[c].allowedChannels;
            return [c, description, usage, DMAllowance, "\n"];
        });
        /*
        This command will show any and all available commands
        wherever it is executed. It uses the exact same way
        of finding commands as go.js, meaning that whatever
        is executable anywhere, will be found by this as well
        */
        if (message.channel.type=="dm") {
            var availableCommands = Object.keys(command).map(function(c) {
                for (i=0; i<commands.length;i++) {
                    //looks for the index of the command, and then
                    //checks if it is allowed in Direct Messages
                    if (commands[i][0]==c && commands[i][3]) {return[c, commands[i][1], commands[i][2], "\n"];}
                }
            //Sorts the commands alphabetically
            }).sort(function(a,b){
                if(a[0] < b[0]) return -1;
                if(a[0] > b[0]) return 1;
                return 0;
            });
            //Some commands will result in empty values
            //in the availableCommands Object, and this
            //will find all empty boxes and cut them out
            for (i=availableCommands.length-1;i>=0;i--) {
                if (!availableCommands[i]) {availableCommands.splice(i,1);}
            }
            //By default, -help will show 7 commands at a time,
            //which is optimal for mobile devices.
            var pageEntries = 7;
            if (args[0] == undefined || isNaN(args[0])) {
                var listPage = 1;
            } else if (args[0] > Math.ceil(availableCommands.length/pageEntries)) {
                var listPage = Math.ceil(availableCommands.length/pageEntries);
            } else {
                var listPage = parseInt(args[0]);
            }
            //Each Command is presented in a separate field,
            //where the title is the command itself and the
            //content is the command's description.
            var messageFields = [];
            var fieldNum=0;
            for (i=(listPage*pageEntries-pageEntries); i<listPage*pageEntries && i<availableCommands.length; i++) {
                messageFields[fieldNum] = {
                    "name": availableCommands[i][2],
                    "value": availableCommands[i][1]
                };
                fieldNum++;
            }
            //If there are more commands to show, this will
            //add an 8th field with a little additional help
            if (listPage*pageEntries<availableCommands.length) {
                messageFields[fieldNum] = {
                    "name": "` `",
                    "value": "\nUse `-help " + (listPage+1) + "` for the next page."
                }
            }
            message.reply("",
                {
                    embed: {
                    "color": 0xc1f1ff,
                    "fields": messageFields
                    }
                }
            ).then(msg => checkDM(msg, message.channel.type));
        }else {
            var availableCommands = Object.keys(command).map(function(c) {
                for (i=0; i<commands.length;i++) {
                    //looks for the index of the command, and then
                    //checks if it's executable in the given channel
                    if (commands[i][0]==c && (channels[c].includes(message.channel.id) || channels[c].includes("All"))) {return[c, commands[i][1], commands[i][2], "\n"];}
                }
            //Sorts the commands alphabetically
            }).sort(function(a,b){
                if(a[0] < b[0]) return -1;
                if(a[0] > b[0]) return 1;
                return 0;
            });
            //Some commands will result in empty values
            //in the availableCommands Object, and this
            //will find all empty boxes and cut them out
            for (i=availableCommands.length-1;i>=0;i--) {
                if (!availableCommands[i]) {availableCommands.splice(i,1);}
            }
            //By default, -help will show 7 commands at a time,
            //which is optimal for mobile devices.
            var pageEntries = 7;
            if (args[0] == undefined || isNaN(args[0])) {
                var listPage = 1;
            } else if (args[0] > Math.ceil(availableCommands.length/pageEntries)) {
                var listPage = Math.ceil(availableCommands.length/pageEntries);
            } else {
                var listPage = parseInt(args[0]);
            }
            //Each Command is presented in a separate field,
            //where the title is the command itself and the
            //content is the command's description.
            var messageFields = [];
            var fieldNum=0;
            for (i=(listPage*pageEntries-pageEntries); i<listPage*pageEntries && i<availableCommands.length; i++) {
                messageFields[fieldNum] = {
                    "name": availableCommands[i][2],
                    "value": availableCommands[i][1]
                };
                fieldNum++;
            }
            //If there are more commands to show, this will
            //add an 8th field with a little additional help
            if (listPage*pageEntries<availableCommands.length) {
                messageFields[fieldNum] = {
                    "name": "` `",
                    "value": "\nUse `-help " + (listPage+1) + "` for the next page."
                }
            }
            message.reply("",
                {
                    embed: {
                    "color": 0xc1f1ff,
                    "fields": messageFields
                    }
                }
            ).then(msg => checkDM(msg, message.channel.type));
        }
    }
};
