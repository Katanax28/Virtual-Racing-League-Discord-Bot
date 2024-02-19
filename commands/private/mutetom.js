const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutetom')
        .setDescription('Mutes Tom for a minute')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
    async execute(interaction) {
        const guild = interaction.guild;
        const tom = guild.members.cache.find(member => member.user.username === 'Tom');

        if (!tom) {
            await interaction.reply('User Tom not found.');
            return;
        }

        if (!tom.voice.channel) {
            await interaction.reply('Tom is not in a voice channel.');
            return;
        }

        try {
            await tom.voice.setMute(true);
            await interaction.reply('Tom has been muted for a minute.');

            setTimeout(async () => {
                await tom.voice.setMute(false);
                await interaction.followUp('Tom has been unmuted.');
            }, 60000); // Unmute after 60000 milliseconds (1 minute)
        } catch (error) {
            console.error(error);
            await interaction.reply('Failed to mute Tom.');
        }
    },
};