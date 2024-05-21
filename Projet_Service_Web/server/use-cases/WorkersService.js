const MyWorker = require("../models/MyWorker.model.js");
const { token1, token2, token3 } = require("../config.json");

const fs = require('fs');
const moment = require('moment');
const path = require('path');

class WorkersService extends Map{
	constructor(){
		super();
		this.instance;
	}

	static getInstance(){ //Singleton
		if(!this.instance){
			this.instance = new WorkersService();
		}
		return this.instance;
	}
	
	addWorker({ workerName }) {
		let newWorker;
		let token = token1;
	
		//rejeter si le nom est déjà utilisé.
		if (this.has(workerName)) {
			throw Error(`cannot create Worker ${workerName} : name already in use.`);
		}
	
		// Fonction pour vérifier si un token est utilisé
		const isTokenUsed = (tokenToCheck) => {
			for (const [_, worker] of this) {
				if (worker.token === tokenToCheck) {
					return true;
				}
			}
			return false;
		};
	
		if (isTokenUsed(token1) && !isTokenUsed(token2)) {
			console.log(`token1 is used`);
			token = token2;
		}
	
		if (isTokenUsed(token2) && !isTokenUsed(token3)) {
			console.log(`token2 is used`);
			token = token3;
		}
	
		if (isTokenUsed(token1) && isTokenUsed(token2) && isTokenUsed(token3)) {
			throw Error(`cannot create Worker ${workerName} : no more token available.`);
		}
	
		try {
			newWorker = new MyWorker({ workerName, token, workersService: this });
		} catch (error) {
			throw Error(`cannot create Worker ${error} ${error.stack}`);
		}
		return newWorker.dump();
	}
	

	deleteWorker({workerName}){

		try{
			//d'abord arrêter le worker 
			const myWorker = this.getWorker({workerName});
			myWorker.kill();
			myWorker.delete();
		} catch (error){
			throw Error(`cannot delete Worker ${workerName} :  ${error} ${error.stack}`);
		}
	}
	
	getWorkers(){
		return Array.from(this);
	}

	getWorkersByStatus({workerStatus}){
		const arrayOfWorkers = new Array();
		this.forEach((value,key,map)=>{
			if(value.isStatus(workerStatus)){
				arrayOfWorkers.push(value);
			}
		})
		return arrayOfWorkers;
	}

	getWorker({workerName}){
		//renvoie L'élément associée à la clé donnée ou undefined si la clé ne fait pas partie de l'objet Map.
		const myWorker = this.get(workerName);
		if(undefined == myWorker){
			throw Error(`cannot get Worker ${workerName}, undefined `);
		}
		return myWorker;
	}


	patchWorker({workerName,payload}){
		const myWorker = this.get(workerName);
		if(undefined == myWorker){
			throw Error(`cannot get Worker ${workerName}, undefined `);
		}
		if(payload.status){
			myWorker.setStatus(payload.status, myWorker.token);
		}
		return myWorker;
	}



	activateWorker({workerName}){
		const myWorker = this.getWorker({workerName});
		myWorker.start();
	}

	killWorker({workerName}){
		const myWorker = this.getWorker({workerName});
		myWorker.kill();
	}

	suspendWorker({workerName}){
		const myWorker = this.getWorker({workerName});
		myWorker.suspend();
	}

	continueWorker({workerName}){
		const myWorker = this.getWorker({workerName});
		myWorker.continue();
	}

	getWorkerStatus({workerName}){
		const myWorker = this.getWorker({workerName});
		if(undefined == myWorker){
			throw Error(`cannot get Worker status : workerName is undefined `);
		}
		return myWorker.getStatus();
	}

	getWorkerLogfile({workerName}){
		const myWorker = this.getWorker({workerName});
		if(undefined == myWorker){
			throw Error(`cannot get Worker logfile : workerName is undefined `);
		}
		return myWorker.getLogfile();
	}

	writeInWorkerLogFile(file, message) {
		const now = new Date().toString().split('G')[0].slice(0, -1);
		fs.appendFile(file, '[' + now + '] ' + message, (err) => {
			if (err) {
				console.error(`cannot write in ${file} : ${err}`);
			}
		});
	}

	getLogsBetweenDates({workerName, startDate, endDate}) {
		return new Promise((resolve, reject) => {
			if (!startDate || !endDate) {
				return reject(new Error('cannot get logs between dates: startDate or endDate is undefined'));
			}
	
			const start = moment(new Date(startDate));
			const end = moment(new Date(endDate));

			console.log(`start : ${start} end : ${end} workerName : ${workerName}`);
	
			const logFilePath = path.join(__dirname, '../models/logs/', workerName + '.log');
	
			fs.readFile(logFilePath, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading the log file:', err);
					return reject(err);
				}
	
				const lines = data.split('\n');
				const filteredLogs = lines.filter(line => {
					const match = line.match(/^\[([^\]]+)\]/);
					if (!match) return false;
					const logDate = moment(new Date(match[1]));
					return logDate.isBetween(start, end, undefined, '[]');
				});
	
				// Transformer les lignes filtrées en JSON
				const logsJson = filteredLogs.map(line => {
					const match = line.match(/^\[([^\]]+)\]\s(.+)/);
					return {
						timestamp: match[1],
						message: match[2]
					};
				});
				resolve(logsJson);
			});
		});
	}

	
	
}

module.exports = { WorkersService };