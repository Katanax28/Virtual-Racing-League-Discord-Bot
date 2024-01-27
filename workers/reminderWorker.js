const fs = require("fs");
require("dotenv").config();
const { parentPort, workerData } = require("worker_threads");
const { Client, Intents, GatewayIntentBits } = require("discord.js");
const token = process.env.TOKEN;

// Initialize the global variable with initial data that is presisted to disk
async function saveScheduleData(scheduleData) {
	let dataString = JSON.stringify(scheduleData, null, 2);
	fs.writeFile("scheduleData.json", dataString, (err) => {
		if (err) throw err;
		console.log("Data written to file");
	});
}
// init
//saveScheduleData([]); // [{ id: messageId, reminderTime: reminderTime, checkinChannelId: checkinChannelId, pendingField: pendingField }, {...}]

// Handle messages from the main thread
parentPort.on("message", (message) => {
	console.log(message);
	let {
		type,
		reminderTime,
		title,
		countryName,
		pendingField,
		checkinChannelId,
		messageId,
	} = message;
	// add a regex here to clean up pendingField
	pendingField = pendingField.value.replace(/'|\\+|\n/g, "");
	switch (type) {
		case "init":
			fs.readFile("scheduleData.json", (err, data) => {
				if (err) throw err;
				scheduleData = JSON.parse(data);
				scheduleData.push({
					id: messageId,
					reminderTime: reminderTime,
					checkinChannelId: checkinChannelId,
					pendingField: pendingField,
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
		scheduleData = JSON.parse(data);
		// console.log(scheduleData);
		const currentTime = new Date();

		const remindersPast = scheduleData.filter(
			(item) => item.reminderTime < currentTime
		);
		remindersPast.forEach((form) => {
			sendReminder(form);
			let updatedScheduleData = scheduleData.filter((item) => item.id !== form.id);
			if (updatedScheduleData.length > 0) {
				saveScheduleData(updatedScheduleData);
			} else {
				saveScheduleData([]);
			}
		});

	});
}

// send reminder message
async function sendReminder(form) {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});
	await client.login(token);
	const checkinChannel = await client.channels.fetch(form.checkinChannelId);
	if(form.pendingField !== "None") {
		await checkinChannel.send(
			`Reminder to those who have not yet confirmed their attendance:\n${form.pendingField}`
		);
	}
}

// Periodically send the schedule (interval in seconds)
setInterval(pendingSchedule, (120 * 1000));
