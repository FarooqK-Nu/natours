/* 
For Separation of concerns
app.js → configuration
server.js → execution
*/

// server is like the file where we do the setup for full project

const dotenv = require('dotenv'); //has to come before every code. cuz Process will be set up here
dotenv.config({ path: './config.env' }); // load all environment var at once from .env

// this handles error in sync code throught our app
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.error(err);

  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB)
  .then(() => console.log(`DB Connected: 🎉`))
  .catch((err) => console.log(`Database Connection failed 💥💥: ${err}`));

console.log(process.env.NODE_ENV);
// start server
const port = 3000;
const server = app.listen(port, () => {
  console.log('app running on port 3000 ...');
});

// this handles error in async code(unhandled promise) throught our app
process.on('unhandledRejection', (err) => {
  console.log('UNHANDELED REJECTION');
  console.error(err);

  server.close(() => {
    process.exit(1);
  });
});

// handling sigter signal from render
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
