const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tour = require('./../../models/tourModel');

dotenv.config({
  path: path.join(__dirname, '../../config.env'),
});
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB)
  .then(() => console.log(`DB Connected: 🎉`))
  .catch((err) => console.log(`Database Connection failed 💥💥: ${err}`));

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
//import data to DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
// console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
