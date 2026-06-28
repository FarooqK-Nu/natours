// this file is the main heart that will recieve and delegate the functionality to each file (Think of it as a central dispatcher)

// IMPORTS///////////////
const path = require('path');
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
// const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
// const mongoSanatize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
// const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
// eslint-disable-next-line import/no-extraneous-dependencies
const compression = require('compression');
// eslint-disable-next-line import/no-extraneous-dependencies
const cookieParser = require('cookie-parser');

// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRoutes = require('./routes/viewRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
app.enable('trust proxy');
// setting up pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors());
app.options('*', cors()); // options is a http method like get/post/del

if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // for redability in terminal

app.set('trust proxy', 1);
// applying rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// using helmet for security headers
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         baseUri: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://js.stripe.com',
//         ],
//         workerSrc: ["'self'", 'blob:'],
//         frameSrc: ["'self'", 'https://js.stripe.com'],
//         fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
//         styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
//         styleSrcElem: [
//           "'self'",
//           "'unsafe-inline'",
//           'https://fonts.googleapis.com',
//           'https://api.mapbox.com',
//         ],
//         connectSrc: [
//           "'self'",
//           'http://localhost:3000',
//           'http://127.0.0.1:3000',
//           'https://*.mapbox.com',
//           'https://api.mapbox.com',
//           'https://api.stripe.com',
//           'ws://localhost:*',
//           'ws://127.0.0.1:*',
//         ],
//       },
//     },
//   }),
// );

// data sanatization against NOSQL query injection
// app.use(mongoSanatize());

// data sanatization against XSS
// app.use(xss());
app.use(compression());

// prevents parameter pollution
app.use(hpp());

// middleware for req.data object
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true })); // to parse data coming from a form
app.use(cookieParser());

// parses the req.query correctly
app.set('query parser', 'extended');

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// mounting routes to url
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
server.js -> app.js -> routes -> controllers -> response

*/
