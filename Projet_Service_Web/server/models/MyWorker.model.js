const { Worker, workerData } = require('worker_threads');

const workerScripts = [];
workerScripts['index_discordChatBot'] = './models/workerScripts/index_discordChatBot.js';

const statusSet = new Set(['installed', 'activated', 'idle', 'terminated']);
const discordStatusSet = new Set(['online', 'idle', 'dnd', 'invisible']);

const fs = require('fs');

/**
 * @swagger
 * components:
 *   schemas:
 *     MyWorker:
 *       type: object
 *       required:
 *         - workerName
 *         - status
 *       properties:
 *         workerName:
 *           type: string
 *           description: The name of the worker
 *           example: John Doe
 *         status:
 *           type: string
 *           description: The status of the worker
 *           example: installed
 */
class MyWorker {
    /**
     * @param {Object} options - Options for creating a worker.
     * @param {string} options.workerName - The name of the worker.
     * @param {string} options.token - The token for the worker.
     * @param {Object} options.workersService - The worker service.
     */
    constructor({workerName, token, workersService}) {
        this.workerName = workerName;
        this.token = token;
        this.scriptFile = workerScripts['index_discordChatBot'];
        this.workersService = workersService;
        this.job;
        this.status = 'installed';
        this.workersService.set(this.workerName, this);
        this.logFile = "./models/logs/" + workerName + ".log";
        this.convFile = "./models/conversations/" + workerName + ".conv.log";

        this.workersService.writeInWorkerLogFile(this.logFile, `Bot instantiated \n`);
    }

    /**
     * Start the worker with the provided token.
     * @param {string} token - The token to use for starting the worker.
     */
    start(token) {
        const worker = new Worker(this.scriptFile, {
            workerData: {
                workerName: this.workerName,
                convFile: this.convFile,
                token: token
            }
        });
        console.log(workerData);
        this.job = worker;

        worker.on('online', () => {
            this.status = 'activated';
        });

        worker.on('message', messageFromWorker => {
            console.log(`message from worker ${this.workerName}: ${messageFromWorker}`);
            this.workersService.writeInWorkerLogFile(this.logFile, `Message from worker ${this.workerName}: ${messageFromWorker} \n`);
        });

        worker.on('error', (code) => {
            this.workersService.writeInWorkerLogFile(this.logFile, `An error occured with code ${code} \n`);
            throw Error(`Worker ${this.workerName} issued an error with code ${code}`);
        });

        worker.on('exit', code => {
            this.status = 'terminated';
        });
    }

    /**
     * Returns a description of the worker.
     * @returns {string} Description of the worker.
     */
    dump() {
        return `This is worker ${this.workerName}`;
    }

    /**
     * Kill the worker.
     */
    kill() {
        if (this.status === 'activated' || 'idle' === this.status) {
            this.job.terminate();
        }
    }

    /**
     * Delete the worker.
     */
    delete() {
        this.kill();
        this.workersService.delete(this.workerName);
        this.workersService.writeInWorkerLogFile(this.logFile, 'Bot deleted \n');
    }

    /**
     * Checks if the worker is in the specified status.
     * @param {string} status - The status to check.
     * @returns {boolean} Whether the worker is in the specified status.
     */
    isStatus(status) {
        return (status === this.status);
    }

    /**
     * Set the worker's status to online.
     */
    setOnline() {
        this.job.postMessage('online');
    }

    /**
     * Set the worker's status to do not disturb (dnd).
     */
    setDnd() {
        this.job.postMessage('dnd');
    }

    /**
     * Set the worker's status to invisible.
     */
    setInvisible() {
        this.job.postMessage('invisible');
    }

    /**
     * Set the worker's status to idle.
     */
    setIdle() {
        this.job.postMessage('idle');
    }

    /**
     * Sets the status of the worker.
     * @param {string} status - The new status to set.
     * @param {string} token - The token to use for certain status changes.
     */
    setStatus(status, token) {
        console.log(`setStatus to ${status}, current is ${this.status}`);
        this.workersService.writeInWorkerLogFile(this.logFile, `setStatus to ${status}, current is ${this.status} \n`);
        if (status === 'terminated') {
            this.delete();
        } else if (status === 'activated' && this.status === 'installed') {
            this.start(token);
        } else if (status === 'idle' && this.status === 'activated') {
            this.setIdle();
        } else if (status === 'dnd' && this.status === 'activated') {
            this.setDnd();
        } else if (status === 'online' && this.status === 'activated') {
            this.setOnline();
        } else if (status === 'invisible' && this.status === 'activated') {
            this.setInvisible();
        }
    }

    /**
     * Get the status of the worker.
     * @returns {string} The status of the worker.
     */
    getStatus() {
        this.workersService.writeInWorkerLogFile(this.logFile, `Status returned to the client: ${this.status} \n`);
        return this.status;
    }
}

module.exports = MyWorker;
