const { parentPort, workerData } = require('worker_threads')

parentPort.onmessage = function (message) {
  if('suspend'== message.data){
    stop();
    parentPort.postMessage(`${workerData.workerName} is idle`);
  }
  if('continue'== message.data){
    start();
    parentPort.postMessage(`${workerData.workerName} is activated`);
  }
}



// generator function that we want to stop/continue in the middle
function* stoppableMethod() {
  // here is the implementation of the algorithm
  // that we want to control
  let i = 0;
  while (true) {
    yield i++;
  }
}

const generatorInstance = stoppableMethod();

// tick generator and perform update of the indicator
const nextStep = () => {
  const  value  = generatorInstance.next().value;
  parentPort.postMessage(`${workerData.workerName} : ${value}`)
}

// state to keep track of the setInterval id
const state = {
  timeoutId: 0,
}

// start method progression
const start = () => {
  // do not start interval if there is already an interval
  // running
  if (state.timeoutId === 0) {
    state.timeoutId = setInterval(() => nextStep(), 1000)
  }
}

// clear timeout to stop auto porgress
const stop = () => { 
  clearTimeout(state.timeoutId);
  state.timeoutId = 0;
}

// tick further one step
const stepForward = () => nextStep()



start();