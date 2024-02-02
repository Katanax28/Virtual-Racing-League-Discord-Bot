const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('woah')
        .setDescription('woah'),
    async execute(interaction) {
        await interaction.reply(`<@900002712345804871>`);
    },
};