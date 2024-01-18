const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('when')
		.setDescription('Lists the time of the races for each tier'),
	async execute(interaction) {
		await interaction.reply(`
Tier 2 races on Saturdays at <t:1662825600:t>
Tier 1 races on Sundays at <t:1662912000:t>
*These times are displayed in your own timezone, and they are subject to change if they collide with IRL F1 races*

*Also please read <#780985448583528448> before you ask questions to the mods. It saves us a lot of time!*`
		);
	},
};