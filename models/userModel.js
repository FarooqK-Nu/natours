const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please procvide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlenght: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please enter a password'],
  },
  photo: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
