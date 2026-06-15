// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

const signToken = (id) =>
  JWT.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  const safeUser = newUser.toObject(); // dont show it to end user
  delete safeUser.password;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: safeUser,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1) check if email & password exist
  if (!email || !password)
    throw new AppError('Please enter password and email', 400);

  // 2) check if user exisit & password is correct
  const user = await User.findOne({ email }).select('+password');
  const isCorrect = await user?.isPasswordCorrect(password, user.password);
  if (!user || !isCorrect)
    throw new AppError('incorrect email or password', 401);

  // 3) gen and send token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
};
