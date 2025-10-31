const fs = require("fs");
const { parentPort, isMainThread } = require("worker_threads");
const { removeWorkers, removeWorker} = require("./workerManager");

// Initialize the global variable with initial data that is persisted to disk
function saveScheduleData(scheduleData = JSON.parse("[]")) {
    const dataArray = Array.isArray(scheduleData) ? scheduleData : [scheduleData];
    const dataString = JSON.stringify(dataArray, null, 2);
    fs.writeFileSync("scheduleData.json", dataString);
}

let globalMessageId;
let globalMessageTitle;

function pendingSchedule(client) {
    fs.readFile("scheduleData.json", (err, data) => {
        if (err) throw err;
        let scheduleData = JSON.parse(data);
        const now = new Date();

        const remindersPast = scheduleData.filter(
            (item) => item.reminderTime < now
        );
        const logTimePast = scheduleData.filter(
            (item) => item.logTime < now
        );
        const reportOpenTimePast = scheduleData.filter((
            (item) => item.reportOpenTime < now
        ))

        remindersPast.forEach((form) => {
            if (!form.reminderTimeElapsed) {
                sendReminder(form, client);
            }
            const updatedScheduleData = scheduleData.find((e) => e.id === form.id);
            updatedScheduleData.reminderTimeElapsed = true;
        });

        logTimePast.forEach((form) => {
            if(!form.logTimeElapsed) {
                sendLog(form, client);
            }
            const updatedScheduleData = scheduleData.find((e) => e.id === form.id);
            updatedScheduleData.logTimeElapsed = true;
        });

        reportOpenTimePast.forEach((form) => {
            sendReportsOpened(form, client);
            removeWorker(form.id);
            scheduleData = scheduleData.filter((item) => item.id !== form.id);
        })

        if (scheduleData.length > 0) {
            saveScheduleData(scheduleData)
        } else {
            saveScheduleData([]);
            removeWorkers();
        }
    });
}

if (!isMainThread) {
    parentPort.on("message", (message) => {
        let {
            type,
            reminderTime,
            logTime,
            reportOpenTime,
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
        globalMessageTitle = title;

        pendingField = pendingField.value.replace(/'|\\+|\n/g, "");
        declinedField = declinedField.value.replace(/'|\\+|\n/g, "");
        switch (type) {
            case "init":
                fs.readFile("scheduleData.json", (err, data) => {
                    if (err) throw err;
                    let scheduleData = JSON.parse(data);
                    scheduleData.push({
                        id: messageId,
                        reminderTime: reminderTime,
                        logTime: logTime,
                        reportOpenTime: reportOpenTime,
                        checkinChannelId: checkinChannelId,
                        logChannelId: logChannelId,
                        pendingField: pendingField,
                        declinedField: declinedField,
                        reminderTimeElapsed: false,
                        logTimeElapsed: false,
                        requiredRoleId: requiredRoleId,
                        title: title,
                        countryName: countryName,
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
async function sendReminder(form, client) {
    try {
        const checkinChannel = await client.channels.fetch(form.checkinChannelId);
        if (form.pendingField !== "None") {
            await checkinChannel.send(
                `Reminder to those who have not yet confirmed their attendance:\n${form.pendingField}`
            );
            console.log(`Reminder sent for check-in with message id: ${form.messageId}`);
        } else {
            await checkinChannel.send(
                `Everybody marked their attendance before the reminder! :partying_face:`
            );
            console.log(`No reminder needed to be sent for check-in with message id: ${form.messageId}`);
        }
    } catch (error) {
        const logChannel = await client.channels.fetch("1197557758778679337").catch(() => null);
        await logChannel.send('Message to remind does not exist or is deleted: ' + error);
        console.log(`Failed to send reminder for check-in with message id: ${form.messageId}`)
    }
}

async function sendLog(form, client) {
    const logChannel = await client.channels.fetch(form.logChannelId).catch((e) => console.log(e));
    try {
        if (form.declinedField !== "None") {
            await logChannel.send(
                `List of drivers who checked out for tomorrow's race:\n${form.declinedField}`
            );
        }
    } catch (error) {
        logChannel.send('Tried to log, but message does not exist or is deleted. Error: ', error);
    }
}

async function sendReportsOpened(form, client) {
    try {
        let reportingChannel = await client.channels.fetch("1197557758778679337")
        await reportingChannel.send(`# Reports opened for ${form.title}: ${form.countryName}\nYou have 24 hours to report your incidents.`);
    } catch (error) {
        const logChannel = await client.channels.fetch("1197557814135095296").catch(() => null);
        await logChannel.send('Message to open reports does not exist or is deleted: ' + error);
        console.log(`Failed to send report open message for check-in with message id: ${form.messageId}`)
    }
}

module.exports = {
    pendingSchedule,
}