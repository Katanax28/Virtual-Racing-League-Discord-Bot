require("dotenv").config();
const { parentPort, workerData } = require("worker_threads");
const { Client, Intents, GatewayIntentBits } = require("discord.js");
const token = process.env.TOKEN;

// Initialize the global variable with initial data
let scheduleData = []; // [{ id: messageId, reminderTime: reminderTime, checkinChannelId: checkinChannelId, pendingField: pendingField }, {...}]

// Handle messages from the main thread
parentPort.on("message", (message) => {
	console.log(message);
	const {
		type,
		reminderTime,
		title,
		countryName,
		pendingField,
		checkinChannelId,
		messageId,
	} = message;
	switch (type) {
		case "init":
			scheduleData.push({
				id: messageId,
				reminderTime: reminderTime,
				checkinChannelId: checkinChannelId,
				pendingField: pendingField,
			});
			break;
		case "update":
			const pollData = scheduleData.find((e) => e.id === messageId);
			if (pollData !== undefined) {
				pollData.pendingField = pendingField;
			}
			break;
		default:
			console.log("Invalid message type");
	}

	// Send a response back to the main thread
	parentPort.postMessage("Data updated successfully");
});

// Define a function to send the schedule with the latest data
function sendSchedule() {
	// Send the first scheduled poll to the main thread
	// parentPort.postMessage(scheduleData);
	console.log(scheduleData);
}

// Periodically send the schedule (adjust the interval as needed)
setInterval(sendSchedule, 5000);

// parentPort.on('message', async (data) => {
//     const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
//     await client.login(data.token);
//
//
//
//     const checkinChannel = await client.channels.fetch(data.checkinChannelId);
//
//     const sendReminder = async () => {
//         // If there are any members in this field, send a message to ping them
//         if (data.pendingField.value !== 'None') {
//             // await checkinChannel.send(`Reminder to those who have not yet confirmed their attendance:\n${data.pendingField.value}`);
//             console.log(`Reminder sent for ${data.title}: ${data.countryName}`);
//         } else {
//             console.log(`No reminders have been sent.`);
//         }
//         console.log('reminder program complete'); //debug
//
// Schedule the next reminder
//     const now = new Date();
//     const nextReminderTime = new Date(data.reminderTime);
//     if (now > nextReminderTime) {
//         nextReminderTime.setDate(nextReminderTime.getDate() + 1);
//     }
//     const delay = nextReminderTime - now;
//     setTimeout(sendReminder, delay);
// };

// // Schedule the first reminder
// const now = new Date();
// const firstReminderTime = new Date(data.reminderTime);
// console.log(firstReminderTime)
// if (now > firstReminderTime) {
//     firstReminderTime.setDate(firstReminderTime.getDate() + 0.5);
// }
// const delay = firstReminderTime - now;
// setTimeout(sendReminder, delay);
// });
