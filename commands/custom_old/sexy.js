const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sexy')
		.setDescription('Pings sexy Norwegian'),
	async execute(interaction) {
		await interaction.reply(`Does somebody want <@424953707302486026> ?`);
	},
};