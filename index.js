require('./functions/twitchNotifier.js');

require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, ActivityType, PermissionFlagsBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;
const modChannelId = process.env.DISCORD_MOD_CHANNEL_ID;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
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
		activities: [{ name: `backmarkers crash`, type: ActivityType.Watching }],
		status: 'online',
	});
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	}
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

// Regex to match Discord invite links
const regex = /((https?:\/\/)?(www\.)?)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi;

client.on("messageCreate", async (msg) => {
	if (regex.test(msg.content) && !msg.member.permissions.has(PermissionFlagsBits.Administrator)) { // If the message contains a Discord invite link
		try {
			// Attempt to send a DM to the user
			await msg.author.send("You are not allowed to send invite links in **Virtual Racing League**. Please review the server rules.");
			// Notify mods about the user's invite link attempt
			const modChannel = client.channels.cache.get(modChannelId);
			if (modChannel) {
				try {
					await modChannel.send(`User ${msg.author.tag} tried to send an invite link in ${msg.channel}.`);
				} catch (error) {
					console.error(`Failed to send message to mod channel: ${error}`);
				}
			}
		} catch (error) {
			console.error(`Could not send DM to ${msg.author.tag}.\n`, error);
			// Notify mods about the failed DM attempt and the user's invite link attempt
			const modChannel = client.channels.cache.get(modChannelId);
			if (modChannel) {
				try {
					await modChannel.send(`Failed to send DM to user ${msg.author.tag} who tried to send an invite link in ${msg.channel}. User may have DMs disabled.`);
				} catch (error) {
					console.error(`Failed to send message to mod channel: ${error}`);
				}
			}
		}
		// Delete the message containing the invite link
		msg.delete().catch(console.error);
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

client.login(token);
