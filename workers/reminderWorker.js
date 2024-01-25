require("dotenv").config();
const { parentPort, workerData } = require('worker_threads');
const { Client, Intents, GatewayIntentBits} = require('discord.js');
const token = process.env.TOKEN;

// Initialize the global variable with initial data
let scheduleData = []; // [{ pollId: "", data: [] }]



// Handle messages from the main thread
parentPort.on("message", (message) => {
    console.log(message);
    const { type, data, pollId } = message;
    console.log(type, data, pollId)
    switch (type) {
        case "init":
            scheduleData.push({ pollId: pollId, data: data });
            break;
        case "update":
            const pollData = scheduleData.find((e) => e.pollId === pollId);
            data.forEach((element) => {
                const item = pollData.data.find((e) => e.id === element.id);
                // check if the item exists
                if (item === undefined) {
                    // Add the item to the array
                    pollData.data.push(element);
                } else {
                    // Update the item with the new data
                    item.voted = element.voted;
                }
            });
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
    console.log(scheduleData)
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
        const now = new Date();
        const nextReminderTime = new Date(data.reminderTime);
        if (now > nextReminderTime) {
            nextReminderTime.setDate(nextReminderTime.getDate() + 1);
        }
        const delay = nextReminderTime - now;
        setTimeout(sendReminder, delay);
    };

    // Schedule the first reminder
    const now = new Date();
    const firstReminderTime = new Date(data.reminderTime);
    console.log(firstReminderTime)
    if (now > firstReminderTime) {
        firstReminderTime.setDate(firstReminderTime.getDate() + 0.5);
    }
    const delay = firstReminderTime - now;
    setTimeout(sendReminder, delay);
// });