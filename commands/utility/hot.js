const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hot')
		.setDescription('Pings Katana'),
	async execute(interaction) {
		await interaction.reply(`Is this a message for da---, I mean <@401389864077099018>?`);
	},
};