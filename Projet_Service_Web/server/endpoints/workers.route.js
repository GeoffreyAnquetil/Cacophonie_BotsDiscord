const express = require('express');
const router = express.Router();

const { WorkersService } = require('../use-cases/WorkersService');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve the list of all workers
 *     responses:
 *       200:
 *         description: A list of all workers.
 */
router.get('/', getWorkers);
function getWorkers(req, res, next) {
    try {
      let instance = WorkersService.getInstance();
      const workers = instance.getWorkers();
      res.status(200).json(workers);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Ressource Not Found`);
    }
}

/**
 * @swagger
 * /status/{status}:
 *   get:
 *     summary: Retrieve workers by status
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: The status of the worker
 *         example: "activated"
 *     responses:
 *       200:
 *         description: A list of workers with the specified status.
 */
router.get('/status/:status', getWorkersByStatus);
function getWorkersByStatus(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerStatus = req.params.status;
      console.log(`controller tries to get worker by status of ${workerStatus}, ${req.params}`);
      const workers = instance.getWorkersByStatus({ workerStatus });
      res.status(200).json(workers);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Ressource Not Found`);
    }
}

/**
 * @swagger
 * /workerName/{workerName}:
 *   get:
 *     summary: Retrieve a worker by name
 *     parameters:
 *       - in: path
 *         name: workerName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the worker
 *         example: "worker1"
 *     responses:
 *       200:
 *         description: The worker with the specified name.
 */
router.get('/workerName/:workerName', getWorkerByName);
function getWorkerByName(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      console.log(`controller tries to get worker by the name of ${workerName}, ${req.params}`);
      const theWorker = instance.getWorker({ workerName });
      res.status(200).json(theWorker);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Ressource Not Found`);
    }
}

/**
 * @swagger
 * /workerName/{workerName}/logs:
 *   get:
 *     summary: Retrieve logs of a worker between two dates
 *     parameters:
 *       - in: path
 *         name: workerName
 *         schema:
 *           type: string
 *           example: "worker1"
 *         required: true
 *         description: The name of the worker
 *       - in: body
 *         name: dateRange
 *         description: The date range for the logs
 *         schema:
 *           type: object
 *           required:
 *             - startDate
 *             - endDate
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *               example: "2024-05-21T14:00:00"
 *             endDate:
 *               type: string
 *               format: date-time
 *               example: "2024-05-21T16:00:00"
 *     responses:
 *       200:
 *         description: Logs of the worker between the specified dates.
 */
router.get('/workerName/:workerName/logs', getLogsBetweenDates);
async function getLogsBetweenDates(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      const { startDate, endDate } = req.body;
      console.log(`controller tries to get logs between ${startDate} and ${endDate}`);

      const logs = await instance.getLogsBetweenDates({ workerName, startDate, endDate });
      res.status(200).json(logs);

    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Resource Not Found`);
    }
}

/**
 * @swagger
 * /workerName/{workerName}:
 *   patch:
 *     summary: Update a worker's status
 *     parameters:
 *       - in: path
 *         name: workerName
 *         schema:
 *           type: string
 *           example: "worker1"
 *         required: true
 *         description: The name of the worker
 *       - in: body
 *         name: payload
 *         description: The new status of the worker
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "activated"
 *     responses:
 *       200:
 *         description: The updated worker.
 */
router.patch('/workerName/:workerName', patchWorkerByName);
function patchWorkerByName(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      const payload = req.body;
      console.log(payload);
      const theWorker = instance.patchWorker({ workerName, payload });
      res.status(200).json(theWorker);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Ressource Not Found`);
    }
}

/**
 * @swagger
 * /workerName/{workerName}:
 *   delete:
 *     summary: Delete a worker by name
 *     parameters:
 *       - in: path
 *         name: workerName 
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the worker
 *     responses:
 *       202:
 *         description: The deleted worker.
 */
router.delete('/workerName/:workerName', deleteWorkerByName);
function deleteWorkerByName(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      const theWorker = instance.deleteWorker({ workerName });
      res.status(202).json(theWorker);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(404).send(`Ressource Not Found`);
    }
}

/**
 * @swagger
 * /:
 *   post:
 *     summary: Add a new worker
 *     parameters:
 *       - in: body
 *         name: worker
 *         description: The worker to create
 *         schema:
 *           type: object
 *           required:
 *             - workerName
 *           properties:
 *             workerName:
 *               type: string
 *               example: "worker1"
 *     responses:
 *       201:
 *         description: The created worker.
 */
router.post('/', addWorker);
function addWorker(req, res, next) {
    try {
      let instance = WorkersService.getInstance();
      let { workerName } = req.body;
      const worker = instance.addWorker({ workerName });
      console.log(`worker added : ${worker}`);
      res.status(201).json(worker);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(500).send('Internal Server Error');
    }
}

/**
 * @swagger
 * /workerName/{workerName}/status:
 *   get:
 *     summary: Retrieve the status of a worker by name
 *     parameters:
 *       - in: path
 *         name: workerName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the worker
 *     responses:
 *       200:
 *         description: The status of the worker.
 */
router.get('/workerName/:workerName/status', getWorkerStatus);
function getWorkerStatus(req, res, next) {
    try {
      let instance = WorkersService.getInstance();
      let workerName = req.params.workerName;
      const status = instance.getWorker({ workerName }).getStatus();
      res.status(200).send(status);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`);
      res.status(500).send('Internal Server Error');
    }
}

module.exports = router;
