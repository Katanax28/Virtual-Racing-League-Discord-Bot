const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mommy')
		.setDescription('Pings mommy Tolga'),
	async execute(interaction) {
		await interaction.reply(`Hewwo mommy <@295301753845448705> UwU`);
	},
};