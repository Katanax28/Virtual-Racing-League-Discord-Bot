const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Pings the tier 2 manager so they finally update Racinghub'),
	async execute(interaction) {
		await interaction.reply(`<@273898253106544641> UPDATE TIER 2 RACINGHUB.`);
	},
};