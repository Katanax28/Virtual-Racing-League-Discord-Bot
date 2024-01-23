const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gay')
		.setDescription('Pings a gay person'),
	async execute(interaction) {
		await interaction.reply(`<@527545007461367829> is gay.`);
	},
};