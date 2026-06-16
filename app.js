//this file is the main heart that will recieve and delegate the functionality to each file (Think of it as a central dispatcher)

// IMPORTS///////////////
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // for redability in terminal

// applying rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

app.use(express.json()); // middleware for req.data object
app.set('query parser', 'extended'); // parses the req.query correctly
app.use(express.static(`${__dirname}/public`));

// mounting routes to url
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handleing all unhandeled routes
app.all('/{*splat}', (req, res, next) => {
  const err = new AppError(
    `the route ${req.originalUrl} is not on the server`,
    404,
  );
  next(err);
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;

/*

Request flow 
server.js → app.js → routes → controllers → response 

*/
