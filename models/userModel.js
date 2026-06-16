const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bycrpt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function () {
  // run only if password was modified
  if (!this.isModified('password')) return;

  // hash the password with cost 12
  this.password = await bycrpt.hash(this.password, 12);

  // delete passwordConfirm field as we dont want it in DB
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function () {
  //this = curr query
  this.find({ active: { $ne: false } });
});

// available on all user document
userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  actualPassword,
) {
  return await bycrpt.compare(candidatePassword, actualPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTcreatedAT) {
  if (!this.passwordChangedAt) return false; // password  not changed

  const changedPasswordAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return JWTcreatedAT < changedPasswordAt;
};

userSchema.methods.createPasswordResetToken = function () {
  // 1) gen token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 2) encrypt token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
