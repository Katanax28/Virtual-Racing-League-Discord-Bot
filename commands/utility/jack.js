const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jack')
		.setDescription('Spells out the correct spelling of Jak'),
	async execute(interaction) {
		await interaction.reply(`It's Jak actually.`);
	},
};