const fs = require("fs");
require("dotenv").config();
const { parentPort, workerData } = require("worker_threads");
const { Client, Intents, GatewayIntentBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;

// Initialize the global variable with initial data that is presisted to disk
async function saveScheduleData(scheduleData) {
	const dataString = JSON.stringify(scheduleData, null, 2);
	fs.writeFile("scheduleData.json", dataString, (err) => {
		if (err) throw err;
	});
}
let globalMessageId;

// Handle messages from the main thread
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
		modChannelId,
	} = message;

	globalMessageId = messageId;
	// add a regex here to clean up pendingField
	pendingField = pendingField.value.replace(/'|\\+|\n/g, "");
	declinedField = declinedField.value.replace(/'|\\+|\n/g, "");
	// console.log("declined:\n" + declinedField + "\npending:\n" + pendingField);
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
					modChannelId: modChannelId,
					pendingField: pendingField,
					declinedField: declinedField,
					reminderTimeElapsed: false,
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

// Define a function to send the schedule with the latest data
function pendingSchedule() {
	// Send the first scheduled poll to the main thread
	// parentPort.postMessage(scheduleData);
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
			saveScheduleData(scheduleData);
		} else {
			saveScheduleData([]);
		}
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
		const message = await checkinChannel.messages.fetch(globalMessageId);
		if(form.pendingField !== "None") {
			await checkinChannel.send(
				`Reminder to those who have not yet confirmed their attendance:\n${form.pendingField}`
			);
		}
	} catch (error) {
		await logChannel.send('Message does not exist or is deleted');
	}

}
async function sendLog(form) {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});
	await client.login(token);
	const checkinChannel = await client.channels.fetch(form.checkinChannelId);
	const modChannel = await client.channels.fetch(form.modChannelId);
	const logChannel = await client.channels.fetch("1197557814135095296");
	try {
		const message = await checkinChannel.messages.fetch(globalMessageId);
		if(form.declinedField !== "None") {
			await modChannel.send(
				`Attendance log:\n${form.declinedField}`
			);
		}
	} catch (error){
		logChannel.send('Message does not exist or is deleted: ', error);
	}

}

// Periodically send the schedule (interval in seconds)
setInterval(pendingSchedule, (120 * 1000));
