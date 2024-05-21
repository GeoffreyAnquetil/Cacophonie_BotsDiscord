
const { Worker, workerData } = require('worker_threads')

const workerScripts = [];
workerScripts['index_discordChatBot'] = './models/workerScripts/index_discordChatBot.js';

const statusSet = new Set(['installed','activated','idle','terminated']);

class MyWorker{
    constructor({workerName,token,workersService}){
        this.workerName = workerName;
        this.token = token;
        this.scriptFile = workerScripts['index_discordChatBot'];
        this.workersService = workersService
        this.job;
        this.status = 'installed';
        this.workersService.set(this.workerName,this);
        this.logFile = "./models/logs/" + workerName + ".log";

        this.workersService.writeInWorkerLogFile(this.logFile, `Bot instantiated \n`);
    }

    start(token){
        const worker = new Worker(this.scriptFile, {
            workerData: {
                workerName: this.workerName,
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
            this.workersService.writeInWorkerLogFile(this.logFile, `An error occured with corde ${code} \n`);
            throw Error(`Worker ${this.workerName} issued an error with code ${code}`);
        });
    
        worker.on('exit', code => {
            this.status = 'terminated';
        });
    }
    

    dump(){
        return `This is worker ${this.workerName}`
    }

    kill(){
        if(this.status=='activated' || 'idle'==this.status=='activated'){
            this.job.terminate()
            this.workersService.writeInWorkerLogFile(this.logFile, 'Bot killed \n');
        }
    }

    delete(){
        this.kill();
        this.workersService.delete(this.workerName);
        this.workersService.writeInWorkerLogFile(this.logFile, 'Bot deleted \n');
    }

    suspend(){
        this.job.postMessage('suspend')
        this.status='idle';
    }

    continue(){
        this.job.postMessage('continue')
    }

    isStatus(status){
        return (status == this.status);
    }

    setStatus(status, token){
        console.log(`setStatus to ${status}, current is ${this.status}`);
        this.workersService.writeInWorkerLogFile(this.logFile, `setStatus to ${status}, current is ${this.status} \n`);
        if(status === 'terminated'){
            this.delete();
        } else if(status === 'idle' && this.status === 'activated'){
            this.suspend();
        } else if(status === 'activated'){
            if(this.status === 'idle'){
                this.continue();
            } else if(this.status === 'installed'){
                this.start(token);
            }
        }
    }
    

    getStatus(){
        this.workersService.writeInWorkerLogFile(this.logFile, `Status returned to the client : ${this.status} \n`);
        return this.status;
    }
}


module.exports = MyWorker;
  