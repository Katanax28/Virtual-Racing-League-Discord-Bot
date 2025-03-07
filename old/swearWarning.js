let lastUsedTimestamp = 0;
const cooldownAmount = 10 * 60 * 1000; // 10 minutes in milliseconds
const { Client, Collection, Events, GatewayIntentBits, ActivityType, PermissionFlagsBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
client.on("messageCreate", async (msg) => {
    if (content.includes("fuck") && (!msg.member.roles.cache.some(role => role.name === 'Moderator') && !msg.member.roles.cache.some(role => role.name === 'Admin'))) {
        const now = Date.now();

        if (now < lastUsedTimestamp + cooldownAmount) {
            return;
        }

        // Update the last used timestamp
        lastUsedTimestamp = now;

        await msg.reply(`**Fact:** Language used in Discord server

**Infringement:** Breach of Article 12.2.1.k of the International Sporting Code

**Decision:** Write formal apology to Admins of the Discord server.
		`)
    }
}