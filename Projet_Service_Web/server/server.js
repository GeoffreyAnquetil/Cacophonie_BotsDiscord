const express = require('express');
var cors = require('cors');
const swaggerSetup = require('./swagger')
const app = express();

swaggerSetup(app);

app.use(cors())


app.use(express.static('public'))

app.use(express.json());   
app.use(express.urlencoded({ extended: true })); 

const workersRouter = require('./endpoints/workers.route');
const WorkersAPIBaseURL = '/api/v1/workers';
app.use(WorkersAPIBaseURL, workersRouter);


const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}${WorkersAPIBaseURL}`)
})
