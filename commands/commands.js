//Here lie all the command names,
//change them if you please.
module.exports = {
	levels: require("./levelsCommand.js"),
    times: require("./timesCommand.js"),
    uptime: require("./uptimeCommand.js"),
    shutdown: require("./shutdownCommand.js"),
    stats: require("./statsCommand.js"),
    say: require("./sayCommand.js"),
    help: require("./helpCommand.js"),
    compare: require("./compareCommand.js"),
    player: require("./playerCommand.js")
};
