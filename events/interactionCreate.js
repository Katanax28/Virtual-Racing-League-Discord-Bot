// events/interactionCreate.js
const { editInteractionReply } = require('../commands/private/checkin.js');
const fs = require('fs');
const path = require('path');
const workerManager = require('../workers/workerManager');
let logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;

// Read and parse the JSON data from scheduleData.json
const scheduleDataPath = path.join(__dirname, '../scheduleData.json');
let scheduleData;

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {

        // ChatInputCommand
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    });
                }
            }
        }

        // Button input
        if (interaction.isButton()) {
            await interaction.deferReply({ephemeral: true}).catch(() => {});

            // Check what message the button was pressed on
            const buttonPressMessage = await interaction.message.fetch().catch(console.error);

            try {
                const data = fs.readFileSync(scheduleDataPath, 'utf8');
                scheduleData = JSON.parse(data);
                if (data == null || scheduleData == null){
                    console.error('Error reading scheduleData.json after button press');
                    return;
                }
            } catch (error) {
                console.error('Error reading scheduleData.json after button press', error);
                return;
            }

            const reminderWorker = workerManager.getWorker(buttonPressMessage.id);

            try {
                const guild = interaction.guild;
                const member = await fetchMember(guild, interaction.user.id).catch(console.error);
                if (member) {
                    let newDate = new Date();
                    let datetime = newDate.getDate() + "/" + (newDate.getMonth() + 1)
                        + "/" + newDate.getFullYear() + " @ "
                        + newDate.getHours() + ":"
                        + newDate.getMinutes() + ":" + newDate.getSeconds();
                    console.log(`${datetime} | ${member.user.username} has interacted with the button: ${interaction.customId}`);
                } else {
                    console.log('Critical error: Member not found');
                }
            } catch (error) {
                console.error('Something went wrong, your program sucks:', error);
            }

            // Check if check-in deadline has passed
            let currentDate = new Date();
            const logTime = getLogTimeByMessageId(buttonPressMessage.id);
            if (logTime == null || currentDate > logTime) {
                const member = await fetchMember(interaction.guild, interaction.user.id).catch(console.error);
                await editInteractionReply(interaction, "The deadline for checking in has passed. If you think something is wrong, please message an admin.");
                console.log(`User <@${member.user.id}> (${member.user.username}) tried to press ${interaction.customId}. However, the logtime passed, so the interaction is ignored.`);
                const logChannel = await client.channels.fetch(logChannelId).catch(console.error);
                await logChannel.send(`User <@${member.user.id}> (${member.user.username}) tried to press ${interaction.customId}. However, the logtime passed, so the interaction is ignored.`);
                return;
            }

            // Check if member has correct roles
            let requiredRoleId = scheduleData.find(item => item.id === buttonPressMessage.id).requiredRoleId;
            if (!interaction.member.roles.cache.has(requiredRoleId)) {
                await editInteractionReply(interaction, "You do not have the required role to interact with this button.");
                const member = await fetchMember(interaction.guild, interaction.user.id).catch(console.error);
                console.log(`User ${member.user.username} is missing the correct role to check in. Interaction ignored.`);
                return;
            }

            const embed = buttonPressMessage.embeds[0];
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
                if (fields[targetField].value === "None" || fields[targetField].value === "") {
                    fields[targetField].value = userId;
                } else {
                    fields[targetField].value = `${fields[targetField].value}\n${userId}`.trim();
                }
            } else {
                for (const [fieldName, field] of Object.entries(fields)) {
                    if (field.value.includes(userId)) {
                        // If the user is already in the target field, do not modify the fields or the message
                        if (fieldName === targetField) {
                            await editInteractionReply(interaction, `You are already registered as ${fieldName}.`);
                            console.log("User already registered as " + fieldName + ", interaction ignored.")
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
            await buttonPressMessage.edit({embeds: [embed]}).catch(console.error);

            try {
                reminderWorker.postMessage({
                    type: "update",
                    pendingField: fields["Pending"],
                    declinedField: fields["Declined"],
                    messageId: buttonPressMessage.id,
                });
            } catch (e) {
                const logChannel = await client.channels.fetch(logChannelId).catch(console.error);
                logChannel.send(`Someone checked in or out. The bot will not be sending a reminder message for this event because an anomaly happened during the uptime of this check-in.`)
                console.log(e);
            }

            await editInteractionReply(interaction, "Attendance updated.").catch(console.error);

            async function fetchMember(guild, memberId) {
                return await guild.members.fetch(memberId).catch(console.error);
            }

            try {
                const member = await fetchMember(interaction.guild, interaction.user.id).catch(console.error);
                if (member) {
                    let newDate = new Date();
                    let datetime = newDate.getDate() + "/" + (newDate.getMonth() + 1)
                        + "/" + newDate.getFullYear() + " @ "
                        + newDate.getHours() + ":"
                        + newDate.getMinutes() + ":" + newDate.getSeconds();
                    console.log(`${datetime} | ${member.user.username} has moved to ${targetField}`);
                } else {
                    console.log('Member not found');
                }
            } catch (error) {
                console.error('Failed to log the change:', error);
            }
        }
    });
};

function getLogTimeByMessageId(messageId) {
    if(scheduleData === null){
        return "1"
    }
    const scheduleItem = scheduleData.find(item => item.id === messageId);
    return scheduleItem ? scheduleItem.logTime : null;
}
