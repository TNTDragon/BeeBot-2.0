module.exports = {
    /* Command Information
    ===============================================================
    This is one of the dev commands, usable only in the logChannel
    which you can customize in settings. However you can make it
    work in any channel by putting the Channel ID within "" and
    separating any channels you want by commas, or just put "All"
    Example:
    allowedChannels: ["321251232131","1579213910451"],

    Please not that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "Provides the uptime of the current BeeBot 2.0 instance.",
    usage: "-uptime",
    allowedInDM: false,
    allowedChannels: [secureConfig.logChannelID],
    call: function(message, args){
        logging.log("Current Uptime", "BeeBot 2.0 has been up for:\n" +
            Math.floor(bot.uptime / 86400000) + " days\n" +
            Math.floor(bot.uptime / 3600000 % 24) + " hours\n" +
            Math.floor(bot.uptime / 60000 % 60) + " minutes and\n" +
            Math.floor(bot.uptime / 1000 % 60) + " seconds.", "blue");
    }
};