const { parentPort, workerData } = require("worker_threads");

// Initialize the global variable with initial data
let scheduleData = []; // [{ pollId: "", data: [] }]

// Handle messages from the main thread
parentPort.on("message", (message) => {
	console.log(message);
	const { type, data, pollId } = message;
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
	parentPort.postMessage(scheduleData[0].data);
}

// Periodically send the schedule (adjust the interval as needed)
setInterval(sendSchedule, 5000);
