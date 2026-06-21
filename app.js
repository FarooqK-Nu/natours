//this file is the main heart that will recieve and delegate the functionality to each file (Think of it as a central dispatcher)

// IMPORTS///////////////
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
// const mongoSanatize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
// const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
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

// using helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: true,
  }),
);

// data sanatization against NOSQL query injection
// app.use(mongoSanatize());

// data sanatization against XSS
// app.use(xss());

// prevents parameter pollution
app.use(hpp());

// middleware for req.data object
app.use(express.json({ limit: '10kb' }));

// parses the req.query correctly
app.set('query parser', 'extended');

// serving static files
app.use(express.static(`${__dirname}/public`));

// mounting routes to url
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
