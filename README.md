# BeeBot 2.0 #

## What am I? ##

BeeBot is a Discord Bot, which provides an easy and clean access to stats from the "The Hive" Minecraft server. The bot was originally made by Maxthat, but is currently maintained and updated by TNT Dragon and Caphaldor. Check out the forum post linked at the bottom for more information on how to set the bot up.

## Bot Features ##

* Player statistics for all Hive gamemodes
* Comparison of stats between players
* A list of speedrunning records for any player
* Information on a players Block Levels
* Information on a specific player
* Swear Filter
* Bot control commands.

*As the bot is constantly under development, there are many more commands that will come in the future!*

You will have to create a "secureConfig.json" in the code folder and have it look like this:

```JSON
{
 "token":"mDRagAiGOcaNlS.Mse0rD.bNm4unR_bARoEt_tCOokOeLn",
 "serverID": "1234567890",
 "logChannelID": "1234567890"
}
```

*You have to replace the example values on the right with: Your bot token, Your server Id, Channel ID of wherever you want the bot to log everything.*

Additionally to that, the bot has a settings area in the config.json file where you can modify some simple things to your liking (full explanation in the forum post at the bottom).

## Embedded message ##

Most responses by BeeBot are color-coded embeds, following these simple rules:

```
Gold  = Hive Data
Red   = Error
Green = Affirmative Log
Blue  = Informative Log
White = Help messages
Black = unassigned (default)
```

*Note: 'White' has a blue tint to be visible in the light version of the Discord application.*

## Contact & Information ##

You can easily contact me (TNT Dragon) on Hive's Community Hub, linked below. Said Discord is also (currently) linked at the bottom of -stats commands, but you can disable that in the settings.

If you have troubles with installing sodium for the bot, you can use the link below to grab a working version and put it in your npm_modules folder. Additionally, you can also download the icon for BeeBot from the link below, courtesy of Adeerable.

## Links ##

[Discord Server](https://discord.gg/q4mAbPK)

[Forum post](https://forum.hivemc.com/threads/beebot-2-0-discord-bot-for-hive-players.299018/)

[Sodium download](https://drive.google.com/file/d/1E-AjE6b9mTCE8OwOqy5gUrilsOY2BuN7/view)

[BeeBot Icon](https://i.imgur.com/w3UEFHc.png)