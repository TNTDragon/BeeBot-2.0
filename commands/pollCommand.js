//This function will react with thumbs up and down
//Whenever a simple poll is created
function addSimpleReactions(message) {
    message.react("👍").catch(function () {
        logging.legacyLog("Fatal Error in adding agree rating.");
    });
   setTimeout(function() {message.react("👎").catch(function () {
        logging.legacyLog("Fatal Error in adding disagree rating.");
    })}, 1000);
    //timeout exists so that agree is always before disagree
}
//This function will add the required reactions,
//dependent on how many poll options were put in
function addComplexReactions(message, amount) {
    var i=0;
    var reactor = setInterval(function() {
        if (i>=amount) {clearInterval(reactor)}
        message.react(config.emojiCodes[i]).catch(function () {
            logging.legacyLog("Fatal Error in adding a reaction.");
        });
        i++;
    }, 500);
}
//If there are poll options to choose from,
//This function will find the separators between them ("|")
function findSeparators(inputArray) {
    var separatorPositions = [],j=0;
    //everything that seems weird about this loop is
    //so to try and prevent empty answers
    for (i = 0; i<(inputArray.length-1);i++) {
        if (inputArray[i] == "|") {
            separatorPositions[j] = i;
            j++;
            i++;
        }
    }
    return separatorPositions
}
//checks for deletion in case not in DM
function checkDM(msg, DM, div) {
    if (DM != "dm") {
        msg.delete(30000/div);
    }
};
module.exports = {
    /* Command Information
    ===============================================================
    If you'd wish to change the description of a command,
    or where it can be executed, here is where you do that.

    By default all this command is allowed in whatever pollChannelID
    is set to, which is also where the polls are posted, but if you
    wish to keep the poll channel for polls only, change the
    allowedChannels: [config.settings.pollChannelID],
    line, seen below, into:
    allowedChannels: ["CHANNEL ID"],
    replacing CHANNEL ID with the number ID of the channel


    Please note that description and usage is only visible in -help,
    and actual command name has to be changed via commands.js
    ===============================================================
    */
    description: "The command will create a poll, do `-poll help` for more information.",
    usage: "-poll {PolL Message} [\"| {Poll answer 1} | { Poll Answer 2} | [etc.]\"]",
    allowedInDM: false,
    allowedChannels: [config.settings.pollChannelID],
    call: function(message, args){
        //First check whether it's a simple poll, or one with custom questions
        if (!args.includes("|")) {
            var response = args.join(" ");
            //this nifty 'if' checks if the question has something other than whitespaces
            if (!(response.replace(/\s+/g,""))) {
                message.reply("",{embed: embed("Error","Is it just me, or did you forget to put a question in your poll?", "red")}).then(msg => checkDM(msg, message.channel.type, 1));;
            //the nature of this if check means you can't make a Yes/No poll that just says "help"
            //but I don't think that's an issue...
            } else if (response == "help"){
                message.delete();
                 message.reply("",{embed: embed("`-poll` Help","Doing `-poll {Question}` will create a simple \"Yes\" or \"No\" poll. You can create custom answers for your poll by adding `| Answer A | Answer B | Answer C` etc. at the end. For example:\nDoing `-poll Is this guide helpful?` Will create the poll and automatically add 👍 and 👎 to it.\nDoing `-poll Is this guide helpful? | Yes | Maybe | No` will create the very same poll, but will associate each of the provided answers with 🇦, 🇧 and 🇨 respectively.\n\n*Do note that you need a space before and after the `|`, as well as actual answers and not empty space in-between them, otherwise it will be seen as a character in your question/answer.*", "white")}).then(msg => checkDM(msg, message.channel.type, 1));;
            } else {
            //If everything is fine and dandy, a simple poll will be made
            bot.channels.get(config.settings.pollChannelID).send(
                "",{embed: embed("Poll from " + message.author.username,response, "pink")}
            ).then(msg => addSimpleReactions(msg));
            }
        //If the poll has separators, then the custom poll approach is taken
        } else {
            var separators = findSeparators(args),response="";
            //For a poll to make sense it needs at least 2 options must be provided,
            //While 20 is the maximum number of reactions that can be added to a message
            if (separators.length<2 || separators.length>20) {
                message.reply("",{embed: embed("Error","You have provided an invalid number of options.\nI need at least 2 and no more than 20.", "red")}).then(msg => checkDM(msg, message.channel.type, 1));;
            } else {
            //Adding the length of arguments at the end of separators
            //is needed for the system to avoid empty answers properly
            separators.push(args.length);
            for (i=0;i<separators[0];i++) {
                response += args[i] + " ";
            }
            //Same as above, checks if there is anything other than whitespaces
            if (!(response.replace(/\s+/g,""))) {
                message.reply("",{embed: embed("Error","Is it just me, or did you forget to put a question in your poll?", "red")}).then(msg => checkDM(msg, message.channel.type, 1));;
            } else {
            //This for loop sews each answers together and puts them in a list
            for (i=0;i<(separators.length-1);i++) {
                var temp = "";
                for (j=(separators[i]+1);j<separators[i+1];j++) {
                    temp += args[j] + " ";
                }
                response += "\n" + config.emojiCodes[i] + " - " + temp;
            }
            //After all is done and prepared, simply send the poll
            bot.channels.get(config.settings.pollChannelID).send(
                "",{embed: embed("Poll from " + message.author.username, response, "pink")}
            ).then(msg => addComplexReactions(msg,(separators.length-2)));
            }}
        }
    }
};