const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bycrpt = require('bcryptjs');

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
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please enter a password'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'Both password must Match',
    },
  },
  photo: String,
});

userSchema.pre('save', async function () {
  // run only if password was modified
  if (!this.isModified('password')) return;

  // hash the password with cost 12
  this.password = await bycrpt.hash(this.password, 12);

  // delete passwordConfirm field as we dont want it in DB
  this.passwordConfirm = undefined;
});

// available on all user document
userSchema.methods.isPasswordCorrect = async (
  candidatePassword,
  actualPassword,
) => await bycrpt.compare(candidatePassword, actualPassword);

const User = mongoose.model('User', userSchema);

module.exports = User;
