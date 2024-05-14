const express = require('express')
const router = express.Router()

const { WorkersService } = require('../use-cases/WorkersService')


router.get('/', getWorkers)
function getWorkers(req, res, next) {
    try {
      let instance = WorkersService.getInstance();
      const workers = instance.getWorkers();
      res.status(200).json(workers)
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(404).send(`Ressource Not Found`)
    }
  }


router.get('/status/:status',getWorkersByStatus)
function getWorkersByStatus(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerStatus = req.params.status;
      console.log(`controller tries to get worker by status of ${workerStatus}, ${req.params}`)
      const workers = instance.getWorkersByStatus({workerStatus});
      res.status(200).json(workers)
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(404).send(`Ressource Not Found`)
    }
  }

  

router.get('/workerName/:workerName',getWorkerByName)
function getWorkerByName(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      console.log(`controller tries to get worker by the name of ${workerName}, ${req.params}`)
      const theWorker = instance.getWorker({workerName});
      res.status(200).json(theWorker)
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(404).send(`Ressource Not Found`)
    }
  }


  router.patch('/workerName/:workerName',patchWorkerByName)
  function patchWorkerByName(req, res, next) {
      try {
        const instance = WorkersService.getInstance();
        const workerName = req.params.workerName;
        const payload = req.body;
        console.log(payload)
        const theWorker = instance.patchWorker({workerName,payload});
        res.status(200).json(theWorker)
      } catch (error) {
        console.error(`>>> ${error} ${error.stack}`)
        res.status(404).send(`Ressource Not Found`)
      }
    }
  


router.delete('/workerName/:workerName',deleteWorkerByName)
function deleteWorkerByName(req, res, next) {
    try {
      const instance = WorkersService.getInstance();
      const workerName = req.params.workerName;
      const theWorker = instance.deleteWorker({workerName});
      res.status(202).json(theWorker)
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(404).send(`Ressource Not Found`)
    }
  }


router.post('/', addWorker)
function addWorker(req, res, next){
    try {
      let instance = WorkersService.getInstance();
      let {workerName,scriptName} = req.body;
      const worker = instance.addWorker({workerName,scriptName});
      res.status(201).json(worker);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(500).send('Internal Server Error')
    }
  }

router.get('/workerName/:workerName/status',getWorkerStatus)
function getWorkerStatus(req, res, next){
    try {
      let instance = WorkersService.getInstance();
      let workerName = req.params.workerName;
      const status = instance.getWorker({workerName}).getStatus();
      res.status(200).send(status);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(500).send('Internal Server Error')
    }
  }


router.get('/workerName/:workerName/logfile',getWorkerLogfile)
function getWorkerLogfile(req, res, next){
    try {
      let instance = WorkersService.getInstance();
      let workerName = req.params.workerName;
      const logfile = instance.getWorkerLogfile({workerName});
      res.status(200).send(logfile);
    } catch (error) {
      console.error(`>>> ${error} ${error.stack}`)
      res.status(500).send('Internal Server Error')
    }
  }

  
module.exports = router