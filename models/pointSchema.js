const mongoose = require('mongoose');

const basePointFields = {
  type: {
    type: String,
    default: 'Point',
    enum: ['Point'],
  },
  coordinates: [Number],
  address: String,
  description: String,
};

exports.pointSchema = new mongoose.Schema(basePointFields);

exports.pointSchemaWithDay = new mongoose.Schema({
  ...basePointFields,
  day: Number,
});
