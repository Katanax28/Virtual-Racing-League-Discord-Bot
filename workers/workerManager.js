const workers = new Map(); // Store workers by an identifier

module.exports = {
    addWorker: (id, worker) => workers.set(id, worker),
    getWorker: (id) => workers.get(id),
    removeWorker: (id) => workers.delete(id),
    listWorkers: () => {
        workers.forEach((worker, id) => {
            console.log(`Worker ID: ${id}, Worker: ${worker}`);
        });
    }
};