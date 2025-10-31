// require('./functions/twitchNotifier.js');

require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    ActivityType,
    PermissionFlagsBits,
    Options
} = require("discord.js");
const {pendingSchedule} = require("./workers/reminderWorker");
const token = process.env.DISCORD_TOKEN;
const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
let logChannel;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    makeCache: Options.cacheWithLimits({
        MessageManager: 50, // Only keep the last 50 messages in memory per channel
    })
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    client.user.setPresence({
        activities: [{name: `What if the backmarkers could keep up?`, type: ActivityType.Custom}],
        status: 'online',
    });
    // Fetch logChannel
    logChannel = client.channels.cache.get(logChannelId);

    // Check if any check-ins have passed the log- or reminder time.
    setInterval(() => pendingSchedule(client), (10 * 1000));

});

// Woah Prizm
function transformCase(input, output) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        if (i < output.length) {
            if (input[i] === input[i].toUpperCase()) {
                result += output[i].toUpperCase();
            } else {
                result += output[i].toLowerCase();
            }
        } else {
            result += output[i] || '';
        }
    }
    // Handle the 'm' in 'prizm' separately
    if (input[input.length - 1] === input[input.length - 1].toUpperCase()) {
        result += 'M';
    } else {
        result += 'm';
    }
    return result;
}

const regex = /((https?:\/\/)?(www\.)?)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi;

client.on("messageCreate", async (msg) => {
    try {
        if (regex.test(msg.content) && !msg.member.permissions.has(PermissionFlagsBits.Administrator)) { // If the message contains a Discord invite link
            try {
                // Log the invite attempt
                if (logChannel) {
                    console.log(`User ${msg.author.tag} tried to send an invite link in ${msg.channel}.`)
                    await logChannel.send(`User <@${msg.author.id}> (${msg.author.tag}) tried to send an invite link in ${msg.channel}.`);
                }
                // Warn user for invite attempt
                await msg.author.send("You are not allowed to send invite links in **Virtual Racing League**.")
                    .catch(() => console.log(`Could not DM ${msg.author.tag} after they sent an invite link.`));
            } catch (error) {
                console.error(`Error handling invite link:`, error);
            }

            // Delete the message containing the invite link
            msg.delete().catch(console.error);
            msg.channel.messages.cache.delete(msg.id); // Ensure message is removed from cache
        }
    } catch {
        console.log("Right. So I don't know how discord can render a member but not their permissions, but here it is, it happened anyways. This error prevented the bot from crashing but it is not your fault, it's just the discord API doing something that doesn't make sense.");
    }

// Woah Prizm
    const content = msg.content.toLowerCase();
    if (content.includes("woah")) {
        // Extract "woah" from the message content
        const woahMatch = msg.content.match(/woah/i);
        if (woahMatch) {
            const transformedPrizm = transformCase(woahMatch[0], "priz");
            await msg.reply(transformedPrizm);
        }
    }
});

// Load event handlers
require('./events/interactionCreate')(client);

client.login(token);
