const { Worker } = require("worker_threads");

// Specify the path to your worker script
const worker = new Worker("./worker.js");

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("Main thread started");

// Handle messages received from the worker
worker.on("message", (message) => {
	console.log("Main thread received message:", message);
});

async function sendData() {
	const initialData = {
		type: "init",
		pollId: "33",
		data: [
			{ id: 1, userId: "aaa", voted: true },
			{ id: 2, userId: "bbb", voted: false },
			{ id: 3, userId: "ccc", voted: true },
			{ id: 4, userId: "aaa", voted: false },
			{ id: 5, userId: "bbb", voted: false },
			{ id: 6, userId: "ccc", voted: true },
		],
	};
	worker.postMessage(initialData);
	console.log("Initial data sent");

	await sleep(10000); // wait 10 seconds so you can see what the worker is doing

	// Assume you have some data to update the worker with
	const updateData = [
		{ id: 2, userId: "aaa", voted: true },
		{ id: 5, userId: "bbb", voted: true },
		{ id: 4, userId: "ccc", voted: true },
		{ id: 7, userId: "ddd", voted: true },
	];
	const sendUpdateData = {
		type: "update",
		pollId: "33",
		data: updateData,
	};

	// Send the update message to the worker
	worker.postMessage(sendUpdateData);
	console.log("Update data sent");
}

sendData();
