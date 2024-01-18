const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('papi')
		.setDescription('Pings papi Xavier'),
	async execute(interaction) {
		await interaction.reply(`Wait, where's <@341551548859547648>? `);
	},
};