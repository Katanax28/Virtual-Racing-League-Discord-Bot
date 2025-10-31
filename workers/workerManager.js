const workers = new Map(); // Store workers by an identifier

module.exports = {
    addWorker: (id, worker) => workers.set(id, worker),
    getWorker: (id) => workers.get(id),
    removeWorker: (id) => {
        const w = workers.get(id);
        if (w) {
            try { w.terminate(); } catch (e) { console.error('Failed to terminate worker', e); }
            workers.delete(id);
        }
    },
    removeWorkers: () => {
        workers.forEach((worker) => {
            worker.terminate();
        });
        workers.clear()

    },
    listWorkers: () => {
        workers.forEach((worker, id) => {
            console.log(`Worker ID: ${id}, Worker: ${worker}`);
        });
    }
};