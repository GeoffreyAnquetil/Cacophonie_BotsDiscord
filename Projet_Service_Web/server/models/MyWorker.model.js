
const { Worker, workerData } = require('worker_threads')

const workerScripts = [];
workerScripts['index_discordChatBot'] = './models/workerScripts/index_discordChatBot.js';

const statusSet = new Set(['installed','activated','idle','terminated']);

const fs = require('fs');

class MyWorker{
    constructor({workerName,token,workersService}){
        this.workerName = workerName;
        this.token = token;
        this.scriptFile = workerScripts['index_discordChatBot'];
        this.workersService = workersService
        this.job;
        this.status = 'installed';
        this.workersService.set(this.workerName,this);
        this.logFile = "./logs/" + workerName + ".log";
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
            console.log('Launching intensive CPU task');
        });
    
        worker.on('message', messageFromWorker => {
            console.log(`message from worker ${this.workerName}: ${messageFromWorker}`);
        });
    
        worker.on('error', (code) => {
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
        }
    }

    delete(){
        this.kill();
        this.workersService.delete(this.workerName);
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
        return this.status;
    }
}


module.exports = MyWorker;
  