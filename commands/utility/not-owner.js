const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('not-owner')
		.setDescription('Pings the not-owner'),
	async execute(interaction) {
		await interaction.reply(`Where's <@326749446312558592> at?`);
	},
};