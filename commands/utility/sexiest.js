const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sexiest')
		.setDescription('Pings the sexiest person in VRL'),
	async execute(interaction) {
		await interaction.reply(`Hey, who wants to fuck <@308476561491755010>?`);
	},
};