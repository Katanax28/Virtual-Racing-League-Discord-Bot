const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t1setup')
		.setDescription('Creates the checkin for tier 1')
		.addStringOption(option =>
			option.setName('country')
				.setDescription('The track of this week')
				.setRequired(true)
				.addChoices(
					{ name: 'Abu Dhabi', value: 'abu_dhabi' },
					{ name: 'Australia', value: 'australia' },
					{ name: 'Austria', value: 'austria' },
					{ name: 'Azerbaijan', value: 'azerbaijan' },
					{ name: 'Bahrain', value: 'bahrain' },
					{ name: 'Belgium', value: 'belgium' },
					{ name: 'Brazil', value: 'brazil' },
					{ name: 'Canada', value: 'canada' },
					{ name: 'China', value: 'china' },
					{ name: 'France', value: 'france' },
					{ name: 'Great Britain', value: 'britain' },
					{ name: 'Hungary', value: 'hungary' },
					{ name: 'Imola', value: 'imola' },
					{ name: 'Italy', value: 'monza' },
					{ name: 'Japan', value: 'japan' },
					{ name: 'Las Vegas', value: 'vegas' },
					{ name: 'Mexico', value: 'mexico' },
					{ name: 'Miami', value: 'miami' },
					// { name: 'Monaco', value: 'monaco' },
					{ name: 'Netherlands', value: 'netherlands' },
					{ name: 'Portugal', value: 'portugal' },
					{ name: 'Qatar', value: 'qatar' },
					{ name: 'Saudi Arabia', value: 'saudi' },
					{ name: 'Singapore', value: 'singapore' },
					{ name: 'Spain', value: 'spain' },
					{ name: 'Texas', value: 'cota' }
				)
		)
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Eg: Season 1, Round 1')
				.setRequired(true)
		)

		// Requires administrator permissions
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const client = interaction.client;

		// Create a mapping of the values to their corresponding names
		const countryChoices = {
			'abu_dhabi': 'Abu Dhabi',
			'australia': 'Australia',
			'austria': 'Austria',
			'azerbaijan': 'Azerbaijan',
			'bahrain': 'Bahrain',
			'belgium': 'Belgium',
			'brazil': 'Brazil',
			'canada': 'Canada',
			'china': 'China',
			'france': 'France',
			'britain': 'Great Britain',
			'hungary': 'Hungary',
			'imola': 'Imola',
			'monza': 'Italy',
			'japan': 'Japan',
			'vegas': 'Las Vegas',
			'mexico': 'Mexico',
			'miami': 'Miami',
			// 'monaco': 'Monaco',
			'netherlands': 'Netherlands',
			'portugal': 'Portugal',
			'qatar': 'Qatar',
			'saudi': 'Saudi Arabia',
			'singapore': 'Singapore',
			'spain': 'Spain',
			'cota': 'Texas'
		};

		// Extract the country and title from the command
		const countryOption = interaction.options.get('country');
		const countryValue = countryOption.value;
		const countryName = countryChoices[countryValue]; // Use the mapping to get the name
		const title = interaction.options.getString('title');

		// Fetch the members from the tier 1 lineups message
		const listChannel = await client.channels.fetch('1197943529285107742');
		const messages = await listChannel.messages.fetch({ limit: 1 });
		if (!messages.size) {
			return interaction.reply('No messages found in the list channel.');
		}
		const message = messages.first();
		// Map over the mentioned users and add an emoji before each mention
		// Use a regular expression to match the user mentions in the message content
		const mentionMatches = message.content.match(/<@(\d+)>/g);


		// Create the accept and decline buttons
		const accept = new ButtonBuilder()
			.setCustomId('accept')
			.setLabel('Accept')
			.setStyle(ButtonStyle.Success);
		const decline = new ButtonBuilder()
			.setCustomId('decline')
			.setLabel('Decline')
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder()
			.addComponents(accept, decline);

		// Initialize the fields
		const acceptedMembers = [];
		const declinedMembers = [];
		const pendingMembers = mentionMatches.map(mention => `${mention}`);

		// Calculate the date of the next Sunday at 6pm CET
		const now = new Date();
		const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay() || 7));
		nextSunday.setHours(18, 0, 0, 0); // Set the time to 6pm
		// Convert to CET (Central European Time)
		nextSunday.setHours(nextSunday.getHours() + 1); // CET is UTC+1

		// Convert the date to a Unix timestamp (seconds since the Unix Epoch)
		const unixTimestamp = Math.floor(nextSunday.getTime() / 1000);

		// Add the description to the embed with Discord's timestamp formatting
		const embed = new EmbedBuilder()
			.setTitle(`${title}: ${countryName}`)
			.setDescription(`<t:${unixTimestamp}:F>\nThis is <t:${unixTimestamp}:R>`)
			.setColor('#1C1A36')
			.setThumbnail('attachment:/img/Flag_of_Austria.svg')
			.addFields(
				{ name: '✅ Accepted:', value: acceptedMembers.join('\n') || 'None', inline: true },
				{ name: '❌ Declined:', value: declinedMembers.join('\n') || 'None', inline: true },
				{ name: '❓ Pending:', value: pendingMembers.join('\n') || 'None', inline: true }
			);

		// Creating the check-in
		const checkinChannel = await client.channels.fetch('1197557758778679337');
		await checkinChannel.send({
			embeds: [embed],
			components: [row],
		});

		// Confirmation of command
		await interaction.reply({
			content: `Tier 1 checkin complete.`,
		});

		// When an interaction with the buttons occurs
		client.on('interactionCreate', async (interaction) => {
			if (!interaction.isButton()) return;
			// Fetch the message
			const message = await interaction.message.fetch();
			// Get the embed from the message
			const embed = message.embeds[0];
			// Get the fields
			// Get the fields
			const fields = {
				'Accepted:': embed.fields.find(field => field.name === '✅ Accepted:'),
				'Declined:': embed.fields.find(field => field.name === '❌ Declined:'),
				'Pending:': embed.fields.find(field => field.name === '❓ Pending:')
			};

			// Find the user in the fields and move them to the appropriate field
			const userId = `<@${interaction.user.id}>`;
			const targetField = interaction.customId === 'accept' ? 'Accepted:' : 'Declined:';
			for (const [fieldName, field] of Object.entries(fields)) {
				if (field.value.includes(userId)) {
					// If the user is already in the target field, do not modify the fields or the message
					if (fieldName === targetField) {
						await interaction.reply({ content: `You are already registered as ${fieldName}.`, ephemeral: true });
						return;
					}
					field.value = field.value.replace(userId, '').trim();
					if (fields[targetField].value === 'None' || fields[targetField].value === '') {
						fields[targetField].value = userId;
					} else {
						fields[targetField].value = `${fields[targetField].value}\n${userId}`.trim();
					}
					break;
				}
			}

			// Check if any field is empty and set it to 'None'
			for (const field of Object.values(fields)) {
				if (field.value.trim() === '') {
					field.value = 'None';
				} else {
					// Replace all occurrences of double newlines with a single newline
					field.value = field.value.replace(/\n\n/g, '\n');
				}
			}

			// Edit the message with the new content
			await message.edit({ embeds: [embed] });
			// Acknowledge the interaction
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Attendance updated.', ephemeral: true });
			}
		});
	},
};