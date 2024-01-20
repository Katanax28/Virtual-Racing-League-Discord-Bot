const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Command for the embed test')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('The track of this week')
                .setRequired(true)
                .addChoices(
                    { name: 'Abu Dhabi', value: 'abu_dhabi' },
                    { name: 'Australia', value: 'australia' },
                    { name: 'Austria', value: 'austria' },
                    { name: 'Azerbaijan', value: 'azerbaijan' },
                    { name: 'Bahrain', value: 'bahrain' },
                    { name: 'Belgium', value: 'belgium' },
                    { name: 'Brazil', value: 'brazil' },
                    { name: 'Canada', value: 'canada' },
                    { name: 'China', value: 'china' },
                    { name: 'France', value: 'france' },
                    { name: 'Great Britain', value: 'britain' },
                    { name: 'Hungary', value: 'hungary' },
                    { name: 'Imola', value: 'imola' },
                    { name: 'Italy', value: 'monza' },
                    { name: 'Japan', value: 'japan' },
                    { name: 'Las Vegas', value: 'vegas' },
                    { name: 'Mexico', value: 'mexico' },
                    { name: 'Miami', value: 'miami' },
                    // { name: 'Monaco', value: 'monaco' },
                    { name: 'Netherlands', value: 'netherlands' },
                    { name: 'Portugal', value: 'portugal' },
                    { name: 'Qatar', value: 'qatar' },
                    { name: 'Saudi Arabia', value: 'saudi' },
                    { name: 'Singapore', value: 'singapore' },
                    { name: 'Spain', value: 'spain' },
                    { name: 'Texas', value: 'cota' }
                )
        )
            .addStringOption(option =>
                option.setName('title')
                    .setDescription('Eg: Season 1, Round 1')
                    .setRequired(true)
            )


            // Requires administrator permissions
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const client = interaction.client;

        // Create a mapping of the values to their corresponding names
        const countryChoices = {
            'abu_dhabi': 'Abu Dhabi',
            'australia': 'Australia',
            'austria': 'Austria',
            'azerbaijan': 'Azerbaijan',
            'bahrain': 'Bahrain',
            'belgium': 'Belgium',
            'brazil': 'Brazil',
            'canada': 'Canada',
            'china': 'China',
            'france': 'France',
            'britain': 'Great Britain',
            'hungary': 'Hungary',
            'imola': 'Imola',
            'monza': 'Italy',
            'japan': 'Japan',
            'vegas': 'Las Vegas',
            'mexico': 'Mexico',
            'miami': 'Miami',
            // 'monaco': 'Monaco',
            'netherlands': 'Netherlands',
            'portugal': 'Portugal',
            'qatar': 'Qatar',
            'saudi': 'Saudi Arabia',
            'singapore': 'Singapore',
            'spain': 'Spain',
            'cota': 'Texas'
        };

// Extract the country and title from the command
        const countryOption = interaction.options.get('country');
        const countryValue = countryOption.value;
        const countryName = countryChoices[countryValue]; // Use the mapping to get the name
        const title = interaction.options.getString('title');

        // Fetch the members from the tier 1 lineups message
        const listChannel = await client.channels.fetch('1197943529285107742');
        const messages = await listChannel.messages.fetch({ limit: 1 });
        if (!messages.size) {
            return interaction.reply('No messages found in the list channel.');
        }
        const message = messages.first();
        // Map over the mentioned users and add an emoji before each mention
        // Use a regular expression to match the user mentions in the message content
        const mentionMatches = message.content.match(/<@(\d+)>/g);
// Map over the matched user IDs to add an emoji before each mention
        const memberMentions = mentionMatches.map(mention => `❓ ${mention}`);


        // Create the accept and decline buttons
        const accept = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);
        const decline = new ButtonBuilder()
            .setCustomId('decline')
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(accept, decline);



        // Confirmation of command
        await interaction.reply({
            content: `Tier 1 checkin complete.`,
        });

        const embed = new EmbedBuilder()
            .setTitle(`${title}: ${countryName}`)
            .setColor('#09081c')
            .addFields({
                    name: 'Members:',
                    value: `${memberMentions.join('\n')}`,
                    inline: true,
                }
            );

        // Creating the check-in
        const checkinChannel = await client.channels.fetch('1197557758778679337');
        await checkinChannel.send({
            embeds: [embed],
            components: [row],
        });

        // When an interaction with the buttons occurs
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;
            // Fetch the message
            const message = await interaction.message.fetch();
            // Get the embed from the message
            const embed = message.embeds[0];
            // Find the field that contains the text you want to edit
            const field = embed.fields.find(field => field.name === 'Members:');
            // Find the question mark emoji and replace it with a cross or a checkmark emoji
            field.value = field.value.replace(/.* <@(\d+)>/g, (match, userId) => {
                if (interaction.customId === 'accept' && interaction.user.id === userId) {
                    // Replace the question mark emoji with a checkmark emoji
                    return `✅ <@${userId}>`;
                } else if (interaction.customId === 'decline' && interaction.user.id === userId) {
                    // Replace the question mark emoji with a cross emoji
                    return `❌ <@${userId}>`;
                } else {
                    // If the interaction was not from this user, leave the emoji as is
                    return match;
                }
            });
            // Edit the message with the new content
            await message.edit({ embeds: [embed] });
            // Edit the deferred reply
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Attendance updated.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Attendance updated.', ephemeral: true });
            }
        });
    },
};