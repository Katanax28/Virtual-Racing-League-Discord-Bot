const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
    if (msg.content === "ping") {
        if (msg.member.roles.cache.has("781184561572216832")) {
            msg.reply("admin pong");
        }else{
            msg.reply("pong");
        }
    }
    if (msg.content.startsWith("T1Checkin") && msg.member.roles.cache.has("781184561572216832") && msg.channel.id === "1197557758778679337") {
        msg.channel.send("<@401389864077099018>");
    }
})


client.login('MTE1MDc5Njg5NzYzNjg0MzUyMA.GvUjhB.O5PffbafkkhXZNLq5uW-ncVSuqTVEWsWJtljvU')