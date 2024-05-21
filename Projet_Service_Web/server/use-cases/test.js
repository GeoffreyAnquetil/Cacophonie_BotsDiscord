const { WorkersService } = require('./WorkersService');

// Créer une instance de WorkersService
const workersService = new WorkersService();

// Appeler getLogsBetweenDates avec des paramètres appropriés
workersService.getLogsBetweenDates({
    workerName: 'test', // Remplacez 'myWorker' par le nom réel du worker
    startDate: '2024-05-21T09:58:00',
    endDate: '2024-05-21T10:02:00'
}).then(logs => {
    console.log('Logs between dates:', logs);
}).catch(err => {
    console.error('Error:', err);
});
