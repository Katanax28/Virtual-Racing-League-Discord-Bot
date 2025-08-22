const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");
const {Worker} = require("worker_threads");
require("dotenv").config();
let logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
let checkinChannelId = process.env.DISCORD_CHECKIN_CHANNEL_ID;
const workerManager = require('../../workers/workerManager');

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
    }).catch(console.error);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkin")
        .setDescription("Creates the checkin for tier 1")
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
                    // {name: "France", value: "france"},
                    {name: "Great Britain", value: "britain"},
                    {name: "Hungary", value: "hungary"},
                    {name: "Imola", value: "imola"},
                    {name: "Italy", value: "monza"},
                    {name: "Japan", value: "japan"},
                    // {name: "Las Vegas", value: "vegas"},
                    {name: "Mexico", value: "mexico"},
                    {name: "Miami", value: "miami"},
                    {name: 'Monaco', value: 'monaco'},
                    {name: "Netherlands", value: "netherlands"},
                    {name: "Portugal", value: "portugal"},
                    {name: "Qatar", value: "qatar"},
                    {name: "Saudi Arabia", value: "saudi"},
                    {name: "Singapore", value: "singapore"},
                    {name: "Spain", value: "spain"},
                    {name: "Texas", value: "cota"},
                    {name: "Random", value: "random"}
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
                .setName("tier")
                .setDescription("Tier of the checkin")
                .setRequired(true)
                .addChoices(
                    {name: 'Tier 1', value: 1},
                )
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
            await interaction.deferReply({ephemeral: true}).catch(console.error);
            const client = interaction.client;
            let lineupChannelId;
            let requiredRoleId;
            let reserveRoleId;
            let colorCode;

            const tier = interaction.options.get("tier");
            if (tier.value === 1) {
                lineupChannelId = "780986553689571358";
                requiredRoleId = "786932803660283925";
                colorCode = "#004BA0";
            }
            // else if (tier.value === 24) {
            //     lineupChannelId = "789226527186223105";
            //     requiredRoleId = "789474486277505045";
            //     colorCode = "#2ECC71";
            // }
            // else if(tier.value === 3) {
            // 	lineupChannelId = "961004601757274133"
            // 	requiredRoleId = "961009916024332308"
            // }
            reserveRoleId = "781171286562045965";

            // Create a mapping of the country values to their corresponding names
            const countryChoices = {
                abu_dhabi: {
                    name: "Abu Dhabi :flag_ae:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290312137814086/are.png",
                },
                australia: {
                    name: "Australia :flag_au:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290324733313094/aus.png",
                },
                austria: {
                    name: "Austria :flag_at:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290333730078911/aut.png",
                },
                azerbaijan: {
                    name: "Azerbaijan :flag_az:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290343670583306/aze.png",
                },
                bahrain: {
                    name: "Bahrain :flag_bh:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290370954539008/bhr.png",
                },
                belgium: {
                    name: "Belgium :flag_be:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290358505840730/bel.png",
                },
                brazil: {
                    name: "Brazil :flag_br:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290378726584441/bra.png",
                },
                canada: {
                    name: "Canada :flag_ca:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290386565734470/can.png",
                },
                china: {
                    name: "China :flag_cn:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290393075306626/chn.png",
                },
                // france: {
                //     name: "France :flag_fr:",
                //     link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290410833973268/fra.png",
                // },
                britain: {
                    name: "Great Britain :flag_gb:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290416869585036/gbr.png",
                },
                hungary: {
                    name: "Hungary :flag_hu:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290422930346076/hun.png",
                },
                imola: {
                    name: "Imola :flag_it:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png",
                },
                monza: {
                    name: "Italy :flag_it:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290431667097690/ita.png",
                },
                japan: {
                    name: "Japan :flag_jp:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290439443329054/jpn.png",
                },
                // vegas: {
                //     name: "Las Vegas :flag_us:",
                //     link: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",
                // },
                mexico: {
                    name: "Mexico :flag_mx:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290457852133376/mex.png",
                },
                miami: {
                    name: "Miami :flag_us:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",
                },
                monaco: {
                    name: 'Monaco :flag_mc:',
                    link: 'https://media.discordapp.net/attachments/1198290212678271096/1198290448201027644/mco.png'
                },
                netherlands: {
                    name: "Netherlands :flag_nl:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290465716453446/nld.png",
                },
                portugal: {
                    name: "Portugal :flag_pt:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290473819832340/prt.png",
                },
                qatar: {
                    name: "Qatar :flag_qa:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290499174416474/qat.png",
                },
                saudi: {
                    name: "Saudi Arabia :flag_sa:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290510423535677/sau.png",
                },
                singapore: {
                    name: "Singapore :flag_sg:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290516501082173/sgp.png",
                },
                spain: {
                    name: "Spain :flag_es:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1198290401820409976/esp.png",
                },
                cota: {
                    name: "Texas :flag_us:",
                    link: "https://media.discordapp.net/attachments/1198290212678271096/1198290525183295670/usa.png",
                },
                random: {
                    name: "Random Track! :question:",
                    link: "https://cdn.discordapp.com/attachments/1198290212678271096/1309258478237520025/2560px-Flag_with_question_mark.png?ex=6740ed7a&is=673f9bfa&hm=8751a9f32d6546410dd2b025582c427ca2314678aaa5628ddd26d64f508822f7&",
                }
            };

            // Extract the country and title from the command
            const countryOption = interaction.options.get("country");
            const countryValue = countryOption.value;
            const countryName = countryChoices[countryValue].name;
            const title = interaction.options.getString("title");
            const countryFlagLink = countryChoices[countryValue].link;

            let sessionTime = interaction.options.getNumber("time");
            if (sessionTime < 12) {
                sessionTime = sessionTime + 12;
            }

            // Fetch the members from the corresponding tiers lineups message
            const listChannel = await client.channels.fetch(lineupChannelId);
            const driverListMessages = await listChannel.messages.fetch({limit: 1});
            if (!driverListMessages.size) {
                await interaction.editReply("No messages found in the list channel.");
                return;
            }
            const driverListMessage = driverListMessages.first();
            const mentionMatches = driverListMessage.content.match(/<@(\d+)>/g);

            // Create the accept and decline buttons
            const accept = createButton("accept", "Accept", ButtonStyle.Success);
            const decline = createButton("decline", "Decline", ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(accept, decline);

            // List the members that need to accept the check-in
            const pendingMembers = mentionMatches.map((mention) => `${mention}`);

            // Calculate the date of the next Sunday at 6pm CET
            const now = new Date();
            const nextSunday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + (7 - now.getDay() || 7)
            );
            nextSunday.setHours(sessionTime, 0, 0, 0); // Set the time to 6pm local Dutch time

            const nextSaturday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + (6 - now.getDay() + 7) % 7
            );
            nextSaturday.setHours(sessionTime, 0, 0, 0); // Set the time to 6pm local Dutch time

            let unixTimestamp;
            let reminderTime;
            let logTime;
            if (tier.value === 1) {
                unixTimestamp = Math.floor(nextSunday.getTime() / 1000);
                reminderTime = new Date(nextSunday.getTime() - 48 * 60 * 60 * 1000);
                logTime = new Date(nextSunday.getTime() - 24 * 60 * 60 * 1000);
                console.log("Tier 1 activated, time:" + nextSunday.getTime())
            }
            if (tier.value === 24) {
                unixTimestamp = Math.floor(nextSaturday.getTime() / 1000);
                reminderTime = new Date(nextSaturday.getTime() - 48 * 60 * 60 * 1000);
                logTime = new Date(nextSaturday.getTime() - 24 * 60 * 60 * 1000);
                console.log("Tier 24 activated, time:" + nextSaturday.getTime())
            }

            const embed = new EmbedBuilder()
                .setTitle(`Tier ${tier.value} Attendance`)
                .setDescription(
                    `**${title}: ${countryName}**\n<t:${unixTimestamp}:F>\nThis is <t:${unixTimestamp}:R>`
                )
                .setColor(colorCode)
                .setThumbnail(countryFlagLink)
                .addFields(
                    {
                        name: "✅ Accepted",
                        value: "None",
                        inline: true,
                    },
                    {
                        name: "❌ Declined",
                        value: "None",
                        inline: true,
                    },
                    {
                        name: "❓ Pending",
                        value: pendingMembers.join("\n") || "None",
                        inline: true,
                    }
                )
            let embedMessage = undefined;
            // Creating the check-in
            const checkinChannel = await client.channels.fetch(checkinChannelId).catch(console.error);
            await checkinChannel
                .send({
                    content: `<@&${requiredRoleId}>`,
                    embeds: [embed],
                    components: [row],
                })
                .then((message) => {
                    embedMessage = message;
                })
                .catch(console.error);

            const logChannel = await client.channels.fetch(logChannelId).catch(console.error);

            const embedFind = embedMessage.embeds[0];
            const pendingField = embedFind.fields.find(
                (field) => field.name === "❓ Pending"
            );
            const declinedField = embedFind.fields.find(
                (field) => field.name === "❌ Declined"
            );

            const reminderWorker = new Worker("./workers/reminderWorker.js");
            workerManager.addWorker(embedMessage.id, reminderWorker);
            reminderWorker.postMessage({
                type: "init",
                reminderTime: reminderTime.getTime(),
                logTime: logTime.getTime(),
                title: title,
                countryName: countryName,
                pendingField: pendingField,
                declinedField: declinedField,
                checkinChannelId: checkinChannel.id,
                messageId: embedMessage.id,
                logChannelId: logChannel.id,
                requiredRoleId: requiredRoleId,
            });
            reminderWorker.on("error", (err) => {
                console.error("An error occurred in the worker:", err);
            });

            // Confirmation of command
            await editInteractionReply(interaction, `Check-in complete.`)

        } catch (error) {
            console.error('An error occurred', error);
        }
    },
    editInteractionReply
}
