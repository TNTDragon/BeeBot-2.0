module.exports = {
    log: function (title, msg, color) {
        bot.channels.get(secureConfig.logChannelID).send("", {
            embed: embed(title, msg, color)
        }).catch(function () {
            console.log("Error whilst attempting to log something.");
        });
    },
    legacyLog: function (msg) {
        bot.channels.get(secureConfig.logChannelID).send(msg).catch(function () {
            console.log("Error whilst attempting to legacyLog something.");
        });
    }
};