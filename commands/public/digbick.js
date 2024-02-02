const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('digbick')
		.setDescription('Pings Czech dig bick guy'),
	async execute(interaction) {
		await interaction.reply(`<@625681969992302608> Waddup broski.`);
	},
};