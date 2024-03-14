const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('username')
        .setDescription('Updates your username')
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("Your new username")
                .setRequired(true)),

    async execute(interaction) {
        async function fetchMember(guild, memberId) {
            try {
                return await guild.members.fetch(memberId);
            } catch (error) {
                console.error('Failed to fetch member:', error);
                return null;
            }
        }
        try{
            const username = interaction.options.get("username");
            const usernameValue = username.value;
            const guild = interaction.guild; // Get the guild from the interaction
            const member = await fetchMember(guild, interaction.user.id);
            if (member) {
                await member.setNickname(usernameValue);
                console.log(`${member.user.username} has updated their username to ${usernameValue}`);
            } else {
                console.log('username change error: Member not found');
            }
        }
        catch (error) {
            console.error('Failed to execute username command', error);
        }
    },
};