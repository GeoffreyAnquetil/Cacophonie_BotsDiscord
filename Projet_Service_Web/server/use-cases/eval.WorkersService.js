const { WorkersService } = require('./WorkersService')


const WSS  =new WorkersService();

WSS.addWorker({workerName:'Jack',scriptName:'worker3'});

WSS.activateWorker({workerName:'Jack'})


setTimeout(()=>{
    WSS.suspendWorker({workerName:'Jack'})
},3500)


setTimeout(()=>{
    WSS.continueWorker({workerName:'Jack'})
},6000)






setTimeout(()=>{
    WSS.deleteWorker({workerName:'Jack'})
},10000)