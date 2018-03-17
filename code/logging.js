module.exports = {
    log: function (title, msg, color) {
        bot.channels.get(config.settings.logChannelID).send("", {
            embed: embed(title, msg, color)
        }).catch(function () {
            console.log("Error whilst attempting to log something.");
        });
    },
    legacyLog: function (msg) {
        bot.channels.get(config.settings.logChannelID).send(msg).catch(function () {
            console.log("Error whilst attempting to (legacy) log something.");
        });
    }
};