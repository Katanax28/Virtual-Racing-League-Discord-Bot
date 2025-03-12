const fs = require("fs");
require("dotenv").config();
const {parentPort, isMainThread} = require("worker_threads");
const {Client, GatewayIntentBits} = require("discord.js");
const {removeWorkers} = require("./workerManager");
const token = process.env.DISCORD_TOKEN;

// Initialize the global variable with initial data that is persisted to disk
function saveScheduleData(scheduleData = JSON.parse("[]")) {
    const dataArray = Array.isArray(scheduleData) ? scheduleData : [scheduleData];
    const dataString = JSON.stringify(dataArray, null, 2);
    fs.writeFileSync("scheduleData.json", dataString);
}

let globalMessageId;

function pendingSchedule() {
    fs.readFile("scheduleData.json", (err, data) => {
        if (err) throw err;
        let scheduleData = JSON.parse(data);
        const currentTime = new Date();

        const remindersPast = scheduleData.filter(
            (item) => item.reminderTime < currentTime
        );
        const logTimePast = scheduleData.filter(
            (item) => item.logTime < currentTime
        );

        remindersPast.forEach((form) => {
            if (!form.reminderTimeElapsed) {
                sendReminder(form);
            }
            let updatedScheduleData = scheduleData.find((e) => e.id === form.id);
            updatedScheduleData.reminderTimeElapsed = true;
        });

        logTimePast.forEach((form) => {
            sendLog(form);
            scheduleData = scheduleData.filter((item) => item.id !== form.id);
        });

        if (scheduleData.length > 0) {
            saveScheduleData(scheduleData)
        } else {
            saveScheduleData([]);
            removeWorkers();
        }
    });
}

if(!isMainThread) {
	parentPort.on("message", (message) => {
		let {
			type,
			reminderTime,
			logTime,
			title,
			countryName,
			pendingField,
			declinedField,
			checkinChannelId,
			messageId,
			logChannelId,
			requiredRoleId,
		} = message;

		globalMessageId = messageId;

		pendingField = pendingField.value.replace(/'|\\+|\n/g, "");
		declinedField = declinedField.value.replace(/'|\\+|\n/g, "");
		switch (type) {
			case "init":
				fs.readFile("scheduleData.json", (err, data) => {
					if (err) throw err;
					scheduleData = JSON.parse(data);
					scheduleData.push({
						id: messageId,
						reminderTime: reminderTime,
						logTime: logTime,
						checkinChannelId: checkinChannelId,
						logChannelId: logChannelId,
						pendingField: pendingField,
						declinedField: declinedField,
						reminderTimeElapsed: false,
						requiredRoleId: requiredRoleId,
					});
					saveScheduleData(scheduleData);
				});

				break;
			case "update":
				fs.readFile("scheduleData.json", (err, data) => {
					if (err) throw err;
					scheduleData = JSON.parse(data);
					const pollData = scheduleData.find((e) => e.id === messageId);
					if (pollData !== undefined) {
						pollData.pendingField = pendingField;
						pollData.declinedField = declinedField;
					}
					saveScheduleData(scheduleData);
				});

				break;
			default:
				console.log("Invalid message type");
		}

		// Send a response back to the main thread
		parentPort.postMessage("Data updated successfully");
	});
}

// send reminder message
async function sendReminder(form) {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    await client.login(token);
    const checkinChannel = await client.channels.fetch(form.checkinChannelId);
    const logChannel = await client.channels.fetch("1197557814135095296");
    try {
        if (form.pendingField !== "None") {
            await checkinChannel.send(
                `Reminder to those who have not yet confirmed their attendance:\n${form.pendingField}`
            );
            console.log(`Reminder sent for check-in with message id: ${form.messageId}`);
        } else {
            console.log(`No reminder needed to be sent for check-in with message id: ${form.messageId}`);
        }
    } catch (error) {
        await logChannel.send('Message to remind does not exist or is deleted: ' + error);
        console.log(`Failed to send reminder for check-in with message id: ${form.messageId}`)
    }

}

async function sendLog(form) {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    await client.login(token);
    const logChannel = await client.channels.fetch(form.logChannelId);
    try {
        if (form.declinedField !== "None") {
            await logChannel.send(
                `Attendance log:\n${form.declinedField}`
            );
        }
    } catch (error) {
        logChannel.send('Tried to log, but message does not exist or is deleted. Error: ', error);
    }
}

module.exports = {
    pendingSchedule,
}