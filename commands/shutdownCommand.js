module.exports = {
    /* Command Information
    ===============================================================
    This is one of the dev commands, usable only in the logChannel
    which you can customize in settings. However you can make it
    work in any channel by putting the Channel ID within "" and
    separating any channels you want by commas, or just put "All"
    Example:
    allowedChannels: ["321251232131","1579213910451"],

    Please note that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Shuts down BeeBot 2.0",
    usage: "-shutdown",
    allowedInDM: false,
    allowedChannels: [secureConfig.logChannelID],
    call: function(message, args){
        logging.log("SHUTDOWN SCHEDULED", "Shutting down in 5 seconds...", "blue");
        setTimeout(shutdown, 5000);
    }
};
//shutdown function
function shutdown() {
    //destroys discord connection
    bot.destroy();
    //ends this node instance; waiting for PM2's service manager to start it up again
    process.exit(1337);
}
