/* 
For Separation of concerns
app.js → configuration
server.js → execution
*/

// server is like the file where we do the setup for full project

const dotenv = require('dotenv'); //has to come before every code. cuz Process will be set up here
dotenv.config({ path: './config.env' }); // load all environment var at once from .env

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
app.listen(port, () => {
  console.log('app running on port 3000 ...');
});
