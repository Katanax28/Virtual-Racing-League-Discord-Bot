const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder, Client } = require('discord.js');
// const cron = require('node-cron');
const { Worker } = require('worker_threads');

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
			'abu_dhabi': { name: 'Abu Dhabi', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290312137814086/are.png' },
			'australia': { name: 'Australia', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290324733313094/aus.png' },
			'austria': { name: 'Austria', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290333730078911/aut.png' },
			'azerbaijan': { name: 'Azerbaijan', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290343670583306/aze.png' },
			'bahrain': { name: 'Bahrain', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290370954539008/bhr.png' },
			'belgium': { name: 'Belgium', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290358505840730/bel.png' },
			'brazil': { name: 'Brazil', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290378726584441/bra.png' },
			'canada': { name: 'Canada', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290386565734470/can.png' },
			'china': { name: 'China', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290393075306626/chn.png' },
			'france': { name: 'France', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290410833973268/fra.png' },
			'britain': { name: 'Great Britain', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290416869585036/gbr.png' },
			'hungary': { name: 'Hungary', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290422930346076/hun.png' },
			'imola': { name: 'Imola', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png' },
			'monza': { name: 'Italy', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png' },
			'japan': { name: 'Japan', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290439443329054/jpn.png' },
			'vegas': { name: 'Las Vegas', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png' },
			'mexico': { name: 'Mexico', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290457852133376/mex.png' },
			'miami': { name: 'Miami', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png' },
			// 'monaco': { name: 'Monaco', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290448201027644/mco.png' },
			'netherlands': { name: 'Netherlands', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290465716453446/nld.png' },
			'portugal': { name: 'Portugal', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290473819832340/prt.png' },
			'qatar': { name: 'Qatar', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290499174416474/qat.png' },
			'saudi': { name: 'Saudi Arabia', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290510423535677/sau.png' },
			'singapore': { name: 'Singapore', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290516501082173/sgp.png' },
			'spain': { name: 'Spain', link: 'https://cdn.discordapp.com/attachments/1198290212678271096/1198290401820409976/esp.png' },
			'cota': { name: 'Texas', link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png' }
		};

		// Extract the country and title from the command
		const countryOption = interaction.options.get('country');
		const countryValue = countryOption.value;
		const countryName = countryChoices[countryValue].name; // Use the mapping to get the name
		const title = interaction.options.getString('title');
		const countryFlagLink = countryChoices[countryValue].link; // Use the mapping to get the flag link

		// Fetch the members from the tier 1 lineups message
		const listChannel = await client.channels.fetch('1197943529285107742');
		const messages = await listChannel.messages.fetch({ limit: 1 });
		if (!messages.size) {
			return interaction.reply('No messages found in the list channel.');
		}
		const message = messages.first();
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
		nextSunday.setHours(18, 0, 0, 0); // Set the time to 6pm local Dutch time

		const unixTimestamp = Math.floor(nextSunday.getTime() / 1000);

		const reminderTime = new Date(nextSunday.getTime() - 48 * 60 * 60 * 1000);
		const testReminderTime = new Date(now.getTime() + 30 * 1000);

		const embed = new EmbedBuilder()
			.setTitle(`Tier 1 Attendance`)
			.setDescription(`**${title}: ${countryName}**\n<t:${unixTimestamp}:F>\nThis is <t:${unixTimestamp}:R>`)
			.setColor('#3835A9')
			.setThumbnail(countryFlagLink)
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

		const messagesFind = await checkinChannel.messages.fetch({ limit: 1 });
		const messageFind = messagesFind.first();
		const embedFind = messageFind.embeds[0];
		const pendingField = embedFind.fields.find(field => field.name === '❓ Pending:');
		const worker = new Worker('./workers/reminderWorker.js');
		worker.postMessage({
			reminderTime: testReminderTime.getTime(),
			token: client.token,
			title: title,
			countryName: countryName,
			pendingField: pendingField,
			checkinChannelId: checkinChannel.id
		});
		worker.on('error', (err) => {
			console.error('An error occurred in the worker:', err);
		});

		// // Schedule a task to run 48 hours before the event
		// const reminderTime = new Date(nextSunday.getTime() - 48 * 60 * 60 * 1000);
		// const reminderCronTime = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;
		// const testReminderCronTime = `56 17 20 1 *`;
		// console.log(reminderCronTime);
		// console.log(testReminderCronTime);
		//
		// cron.schedule(testReminderCronTime, async () => {
		// 	console.log('reminder program started');
		//
		// 	const checkinChannel = await client.channels.fetch('1197557758778679337');
		// 	const messages = await checkinChannel.messages.fetch({ limit: 1 });
		// 	const message = messages.first();
		// 	const embed = message.embeds[0];
		// 	const pendingField = embed.fields.find(field => field.name === '❓ Pending:');
		// 	console.log(`Pending field value: ${pendingField.value}`); // Log the value of the 'Pending:' field
		//
		// 	// If there are any members in this field, send a message to ping them
		// 	if (pendingField.value !== 'None') {
		// 		console.log('Sending reminder...'); // debug
		// 		await checkinChannel.send(`Reminder for those who have not yet confirmed their attendance: ${pendingField.value}`);
		// 		console.log(`Reminder sent for ${title}: ${countryName}`);
		// 		console.log('Reminder sent.'); // debug
		// 	}else{
		// 		console.log(`No reminders have been sent.`);
		// 	}
		// 	console.log('reminder program complete'); //debug
		// });



		// Confirmation of command
		await interaction.reply({
			content: `Tier 1 checkin complete.`,
			ephemeral: true,
		});

		// When an interaction with the buttons occurs
		client.on('interactionCreate', async (interaction) => {
			if (!interaction.isButton()) return;
			const message = await interaction.message.fetch();
			const embed = message.embeds[0];
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
					// Get rid of double newlines
					field.value = field.value.replace(/\n\n/g, '\n');
				}
			}

			// Edit the message with the new content
			await message.edit({ embeds: [embed] });
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Attendance updated.', ephemeral: true });
			}
		});
	},
};