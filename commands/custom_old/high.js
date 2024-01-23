const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('high')
		.setDescription('Pings stoned maltese guy'),
	async execute(interaction) {
		await interaction.reply(`Hi <@203938232684118016>, how much weed have you smoked today?`);
	},
};