const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require("discord.js");
const {Worker} = require("worker_threads");
const fs = require("fs");
require("dotenv").config();
modChannelId = process.env.DISCORD_MOD_CHANNEL_ID;
checkinChannelId = process.env.DISCORD_CHECKIN_CHANNEL_ID;

// function list
function createButton(customId, label, style) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style);
}

async function editInteractionReply(interaction, content) {
    await interaction.editReply({
        content: content,
        ephemeral: true,
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("t2checkin")
        .setDescription("Creates the checkin for tier 2")
        .addStringOption((option) =>
            option
                .setName("country")
                .setDescription("The track of this week")
                .setRequired(true)
                .addChoices(
                    {name: "Abu Dhabi", value: "abu_dhabi"},
                    {name: "Australia", value: "australia"},
                    {name: "Austria", value: "austria"},
                    {name: "Azerbaijan", value: "azerbaijan"},
                    {name: "Bahrain", value: "bahrain"},
                    {name: "Belgium", value: "belgium"},
                    {name: "Brazil", value: "brazil"},
                    {name: "Canada", value: "canada"},
                    {name: "China", value: "china"},
                    {name: "France", value: "france"},
                    {name: "Great Britain", value: "britain"},
                    {name: "Hungary", value: "hungary"},
                    {name: "Imola", value: "imola"},
                    {name: "Italy", value: "monza"},
                    {name: "Japan", value: "japan"},
                    {name: "Las Vegas", value: "vegas"},
                    {name: "Mexico", value: "mexico"},
                    {name: "Miami", value: "miami"},
                    // { name: 'Monaco', value: 'monaco' },
                    {name: "Netherlands", value: "netherlands"},
                    {name: "Portugal", value: "portugal"},
                    {name: "Qatar", value: "qatar"},
                    {name: "Saudi Arabia", value: "saudi"},
                    {name: "Singapore", value: "singapore"},
                    {name: "Spain", value: "spain"},
                    {name: "Texas", value: "cota"}
                )
        )
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Eg: Season 1, Round 1")
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("time")
                .setDescription("Set time in UTC")
                .setRequired(true)
        )
        // Requires administrator permissions
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        try {
            await interaction.deferReply({ephemeral: true});
            const client = interaction.client;
            const lineupChannelId = "789226527186223105";
            const requiredRoleId = "789474486277505045";

            // Create a mapping of the country values to their corresponding names
            const countryChoices = {
                abu_dhabi: {name: "Abu Dhabi", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290312137814086/are.png",},
                australia: {name: "Australia", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290324733313094/aus.png",},
                austria: {name: "Austria", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290333730078911/aut.png",},
                azerbaijan: {name: "Azerbaijan", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290343670583306/aze.png",},
                bahrain: {name: "Bahrain", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290370954539008/bhr.png",},
                belgium: {name: "Belgium", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290358505840730/bel.png",},
                brazil: {name: "Brazil", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290378726584441/bra.png",},
                canada: {name: "Canada", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290386565734470/can.png",},
                china: {name: "China", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290393075306626/chn.png",},
                france: {name: "France", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290410833973268/fra.png",},
                britain: {name: "Great Britain", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290416869585036/gbr.png",},
                hungary: {name: "Hungary", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290422930346076/hun.png",},
                imola: {name: "Imola", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png",},
                monza: {name: "Italy", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png",},
                japan: {name: "Japan", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290439443329054/jpn.png",},
                vegas: {name: "Las Vegas", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",},
                mexico: {name: "Mexico", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290457852133376/mex.png",},
                miami: {name: "Miami", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",},
                monaco: { name: 'Monaco', url: 'https://media.discordapp.net/attachments/1198290212678271096/1198290448201027644/mco.png' },
                netherlands: {name: "Netherlands", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290465716453446/nld.png",},
                portugal: {name: "Portugal", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290473819832340/prt.png",},
                qatar: {name: "Qatar", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290499174416474/qat.png",},
                saudi: {name: "Saudi Arabia", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290510423535677/sau.png",},
                singapore: {name: "Singapore", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290516501082173/sgp.png",},
                spain: {name: "Spain", url: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290401820409976/esp.png",},
                cota: {name: "Texas", url: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",},
            };

            // Extract the country and title from the command
            const countryOption = interaction.options.get("country");
            const countryValue = countryOption.value;
            const countryName = countryChoices[countryValue].name;
            const title = interaction.options.getString("title");
            const countryFlagUrl = countryChoices[countryValue].url;

            let sessionTime = interaction.options.getNumber("time");
            if (sessionTime < 12) {
                sessionTime = sessionTime + 12;
            }

            // Fetch the members from the corresponding tiers lineups message
            const listChannel = await client.channels.fetch(lineupChannelId);
            const messages = await listChannel.messages.fetch({limit: 1});
            if (!messages.size) {
                await interaction.editReply("No messages found in the list channel.");
                return;
            }
            const message = messages.first();
            const mentionMatches = message.content.match(/<@(\d+)>/g);

            // Create the accept and decline buttons
            const accept = createButton("accept", "Accept", ButtonStyle.Success);
            const decline = createButton("decline", "Decline", ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(accept, decline);

            // Initialize the fields
            const acceptedMembers = [];
            const declinedMembers = [];
            const pendingMembers = mentionMatches.map((mention) => `${mention}`);

            // Calculate the date of the next Sunday at 6pm CET
            const now = new Date();
            const nextSaturday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + (6 - now.getDay() + 7) % 7
            );
            nextSaturday.setHours(sessionTime, 0, 0, 0); // Set the time to the prompt time  (UTC)

            let unixTimestamp = Math.floor(nextSaturday.getTime() / 1000);
            let reminderTime = new Date(nextSaturday.getTime() - 48 * 60 * 60 * 1000);
            let logTime = new Date(nextSaturday.getTime() - 24 * 60 * 60 * 1000);
            console.log("Tier 2 activated, time:" + nextSaturday.getTime())

            const embed = new EmbedBuilder()
                .setTitle(`Tier 2 Attendance`)
                .setDescription(
                    `**${title}: ${countryName}**\n<t:${unixTimestamp}:F>\nThis is <t:${unixTimestamp}:R>`
                )
                .setColor("#2ECC71")
                .setThumbnail(countryFlagUrl)
                .addFields(
                    {
                        name: "✅ Accepted",
                        value: acceptedMembers.join("\n") || "None",
                        inline: true,
                    },
                    {
                        name: "❌ Declined",
                        value: declinedMembers.join("\n") || "None",
                        inline: true,
                    },
                    {
                        name: "❓ Pending",
                        value: pendingMembers.join("\n") || "None",
                        inline: true,
                    }
                );

            let messageFind;
            // Creating the check-in
            const checkinChannel = await client.channels.fetch(checkinChannelId);
            await checkinChannel
                .send({
                    content: `<@&${requiredRoleId}>`,
                    embeds: [embed],
                    components: [row],
                })
                .then((message) => {
                    messageFind = message;
                })
                .catch(console.error);

            const modChannel = await client.channels.fetch(modChannelId);
            const embedFind = messageFind.embeds[0];
            const pendingField = embedFind.fields.find(
                (field) => field.name === "❓ Pending"
            );
            const declinedField = embedFind.fields.find(
                (field) => field.name === "❌ Declined"
            );

            const reminderWorker = new Worker("./workers/reminderWorker.js");
            reminderWorker.postMessage({
                type: "init",
                reminderTime: reminderTime.getTime(),
                logTime: logTime.getTime(),
                title: title,
                countryName: countryName,
                pendingField: pendingField,
                declinedField: declinedField,
                checkinChannelId: checkinChannel.id,
                messageId: messageFind.id,
                modChannelId: modChannel.id,
            });
            reminderWorker.on("error", (err) => {
                console.error("An error occurred in the worker:", err);
            });

            // Confirmation of command
            await editInteractionReply(interaction, `Tier 2 checkin complete.`)

            // When an interaction with the buttons occurs
            client.on("interactionCreate", async (interaction) => {
                if (!interaction.isButton()) return;
                await interaction.deferReply({ephemeral: true}).catch();

                try{
                    const guild = interaction.guild; // Get the guild from the interaction
                    const member = await fetchMember(guild, interaction.user.id);
                    if (member) {
                        let newDate = new Date();
                        let datetime = newDate.getDate() + "/" + (newDate.getMonth() + 1)
                            + "/" + newDate.getFullYear() + " @ "
                            + newDate.getHours() + ":"
                            + newDate.getMinutes() + ":" + newDate.getSeconds();
                        console.log(`${datetime} | ${member.user.username} has interacted with a button`);
                    } else {
                        console.log('Critical error: Member not found');
                    }
                } catch (error) {
                    console.error('Something went wrong, your program sucks:', error);
                }

                const message = await interaction.message.fetch();

                // Check if the interaction is related to the specific message
                if (message.id !== messageFind.id){
                    console.log("message.id is not messageFind.id");
                    console.log("message.id: " + message.id);
                    console.log("messageFind.id: " + messageFind.id);
                    return;
                }

                let currentdate = new Date();
                if (currentdate > logTime) {
                    await editInteractionReply(interaction, "The deadline for checking in has passed. If you have a good reason for missing the deadline, please message an admin.");
                    console.log("logtime passed, interaction ignored.");
                    return;
                }

                // Check if the user has the role required to check in for that particular tier.
                if (!interaction.member.roles.cache.has(requiredRoleId)) {
                    await editInteractionReply(interaction, "You do not have the required role to interact with this button.");
                    console.log("Missing role, interaction ignored.");
                    return;
                }

                const embed = message.embeds[0];
                const fields = {
                    "Accepted": embed.fields.find((field) => field.name.startsWith("✅ Accepted")),
                    "Declined": embed.fields.find((field) => field.name.startsWith("❌ Declined")),
                    "Pending": embed.fields.find((field) => field.name.startsWith("❓ Pending")),
                };

                // Find the user in the fields and move them to the appropriate field
                const userId = `<@${interaction.user.id}>`;
                const targetField = interaction.customId === "accept" ? "Accepted" : "Declined";

                // If the user is not in the pending list, add them directly to the accepted or declined field
                if (!fields["Pending"].value.includes(userId) && !fields["Accepted"].value.includes(userId) && !fields["Declined"].value.includes(userId)) {
                    if (
                        fields[targetField].value === "None" ||
                        fields[targetField].value === ""
                    ) {
                        fields[targetField].value = userId;
                    } else {
                        fields[targetField].value =
                            `${fields[targetField].value}\n${userId}`.trim();
                    }
                } else {
                    for (const [fieldName, field] of Object.entries(fields)) {
                        if (interaction.message.id === messageFind.id && field.value.includes(userId)) {
                            // If the user is already in the target field, do not modify the fields or the message
                            if (fieldName === targetField) {
                                await editInteractionReply(interaction, `You are already registered as ${fieldName}.`);
                                console.log("User already registered as " + fieldName + ", interaction ignored.");
                                return;
                            }
                            field.value = field.value.replace(userId, "").trim();
                            if (fields[targetField].value === "None" || fields[targetField].value === "") {
                                fields[targetField].value = userId;
                            } else {
                                fields[targetField].value = `${fields[targetField].value}\n${userId}`.trim();
                            }
                            break;
                        }
                    }
                }

                // Check if any field is empty and set it to 'None'
                for (const field of Object.values(fields)) {
                    if (field.value.trim() === "") {
                        field.value = "None";
                    } else {
                        // Get rid of double newlines
                        field.value = field.value.replace(/\n\n/g, "\n");
                    }
                }

                // Split the value of each field by newline to get an array of members
                const acceptedMembersArray = fields["Accepted"].value.split("\n");
                const declinedMembersArray = fields["Declined"].value.split("\n");
                const pendingMembersArray = fields["Pending"].value.split("\n");

                // Get the length of each array to find the count of members
                const acceptedCount = acceptedMembersArray[0] === "None" ? 0 : acceptedMembersArray.length;
                const declinedCount = declinedMembersArray[0] === "None" ? 0 : declinedMembersArray.length;
                const pendingCount = pendingMembersArray[0] === "None" ? 0 : pendingMembersArray.length;

                fields["Accepted"].name = `✅ Accepted (${acceptedCount})`;
                fields["Declined"].name = `❌ Declined (${declinedCount})`;
                fields["Pending"].name = `❓ Pending (${pendingCount})`;

                // Edit the message with the new content
                await message.edit({embeds: [embed]});

                reminderWorker.postMessage({
                    type: "update",
                    pendingField: fields["Pending"],
                    declinedField: fields["Declined"],
                    messageId: messageFind.id,
                });

                try {
                    await editInteractionReply(interaction, "Attendance updated.");
                } catch (error) {
                    console.error('An error occurred:', error);
                }

                async function fetchMember(guild, memberId) {
                    try {
                        return await guild.members.fetch(memberId);
                    } catch (error) {
                        console.error('Failed to fetch member:', error);
                        return null;
                    }
                }

                try {
                    const guild = interaction.guild; // Get the guild from the interaction
                    const member = await fetchMember(guild, interaction.user.id);
                    if (member) {
                        let newDate = new Date();
                        let datetime = newDate.getDate() + "/" + (newDate.getMonth() + 1)
                            + "/" + newDate.getFullYear() + " @ "
                            + newDate.getHours() + ":"
                            + newDate.getMinutes() + ":" + newDate.getSeconds();
                        console.log(`${datetime} | ${member.user.username} has moved to ${targetField} for Tier 2: ${countryName} checkin`);
                    } else {
                        console.log('Member not found');
                    }
                } catch (error) {
                    console.error('Failed to log the change:', error);
                }
            });
        } catch (error) {
            console.error('An error occured', error);
        }
    }
}