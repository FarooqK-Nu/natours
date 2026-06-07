//this file is the main heart that will recieve and delegate the functionality to each file (Think of it as a central dispatcher)

// IMPORTS///////////////
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(morgan('dev')); // for redability in terminal
app.use(express.json()); // middleware for req.data object

// mounting routes to url
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

/*

Request flow 
server.js → app.js → routes → controllers → response 

*/
