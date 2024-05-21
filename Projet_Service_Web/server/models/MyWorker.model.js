
const { Worker, workerData } = require('worker_threads')

const workerScripts = [];
workerScripts['index_discordChatBot'] = './models/workerScripts/index_discordChatBot.js';

const statusSet = new Set(['installed','activated','idle','terminated']);

const discordStatusSet = new Set(['online','idle','dnd','invisible']);

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
            this.workersService.writeInWorkerLogFile(this.logFile, `An error occured with code ${code} \n`);
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
        this.workersService.writeInWorkerLogFile(this.logFile, 'Bot deleted \n');
    }

    isStatus(status){
        return (status == this.status);
    }

    setOnline(){
        this.job.postMessage('online');
    }

    setDnd(){
        this.job.postMessage('dnd');
    }

    setInvisible(){
        this.job.postMessage('invisible');
    }

    setIdle(){
        this.job.postMessage('idle');
    }

    /**
     * Sets the status of the worker.
     * @param {string} status - The new status to set.
     * Status about application : 
     * - installed -> not started, status when the worker is created
     * - activated -> started
     * - terminated -> kills the worker
     * Status about discord bot :
     * - idle -> bot will say it's afk and won't answer
     * - online -> bot will answer
     * - dnd -> bot will say it's busy and won't answer
     * - invisible -> bot will be invisible and won't answer
     * @param {string} token - The token to use for certain status changes.
     */
    setStatus(status, token){   
        console.log(`setStatus to ${status}, current is ${this.status}`);
        this.workersService.writeInWorkerLogFile(this.logFile, `setStatus to ${status}, current is ${this.status} \n`);
        // Gestion des status de l'application
        if(status === 'terminated'){
            this.delete();
        } else if(status === 'activated' && this.status === 'installed'){
            this.start(token);
        }
        // Gestion des statuts Discord
        else if(status === 'idle' && this.status == 'activated'){
            this.setIdle();
        } else if(status === 'dnd' && this.status == 'activated'){
            this.setDnd();
        } else if(status === 'online' && this.status == 'activated'){
            this.setOnline();
        } else if(status === 'invisible' && this.status == 'activated'){
            this.setInvisible();
        }
    }

    //const discordStatusSet = new Set(['online','idle','dnd','invisible']);
    /*
    setDiscordStatus(status, token){
        console.log(`setStatus to ${status}, current is ${this.status}`);
        if(status === online){
            this.job.postMessage('online');
        } else if(status === 'idle'){
            this.job.postMessage('idle');
        } else if(status === 'dnd'){
            this.job.postMessage('dnd');
        } else if(status === 'invisible'){
            this.job.postMessage('invisible');
        }
    }
    */

    getStatus(){
        this.workersService.writeInWorkerLogFile(this.logFile, `Status returned to the client : ${this.status} \n`);
        return this.status;
    }
}


module.exports = MyWorker;
  