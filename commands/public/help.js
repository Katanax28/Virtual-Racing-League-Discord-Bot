const { SlashCommandBuilder } = require('discord.js');

var fs = require('fs');
var files = fs.readdirSync('./commands/public/');
var filesRpl = files.map(file => file.replace(/.js$/, ''));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows a list of all commands'),
	async execute(interaction) {
		await interaction.reply('List of commands:\n' + filesRpl.join('\n'));
	},
};