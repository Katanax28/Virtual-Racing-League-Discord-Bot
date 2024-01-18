const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daddy')
		.setDescription('Pings daddy Jak'),
	async execute(interaction) {
		await interaction.reply(`Who's asking for <@344452579889250304>?`);
	},
};