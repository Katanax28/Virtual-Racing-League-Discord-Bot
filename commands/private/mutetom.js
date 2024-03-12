const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutetom')
        .setDescription('Mutes Tom for a minute')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        async function fetchMember(guild, memberId) {
            try {
                return await guild.members.fetch(memberId);
            } catch (error) {
                console.error('Failed to fetch member:', error);
                return null;
            }
        }

// Usage
        const guild = interaction.guild; // Get the guild from the interaction
        const memberId = '326749446312558592'; // Replace with the actual member ID
        const tom = await fetchMember(guild, memberId);
        if (tom) {
            console.log(`${tom.user.username} has been muted`);
        } else {
            console.log('Member not found');
        }

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
            await interaction.reply('Tom has been muted.');

            setTimeout(async () => {
                await tom.voice.setMute(false);
                await interaction.followUp('Tom has been unmuted.');
            }, 10000); // Unmute after 1000 milliseconds (10 seconds)
        } catch (error) {
            console.error(error);
            await interaction.reply('Failed to mute Tom.');
        }
    },
};