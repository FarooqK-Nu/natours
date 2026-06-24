// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) =>
  JWT.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendResponse = (user, code, res, includeUser = true) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  // send jwt via cookies
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(code).json({
    status: 'success',
    token,
    ...(includeUser && user ? { data: { user } } : {}), //dont include data field if includeUser=false
  });
};

exports.signup = async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const safeUser = newUser.toObject(); // dont show it to end user
  delete safeUser.password;

  //send token
  createSendResponse(safeUser, 201, res);
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
  createSendResponse(user, 200, res, false);
};

exports.protect = async (req, res, next) => {
  let token;
  // 1) getting token and check if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    throw new AppError(
      'you are not logged IN !, Please login to get acccess',
      401,
    );
  }

  // 2) token verification
  const verify = promisify(JWT.verify);
  const decode = await verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user still exists
  const currUser = await User.findById(decode.id);
  if (!currUser)
    throw new AppError(
      'The user belonging to this token, no longer exisit',
      401,
    );

  // 4) check if user changed password after token was issued
  if (currUser.changedPasswordAfter(decode.iat)) {
    throw new AppError(
      'User recently changed password, Please login again',
      401,
    );
  }

  // 5) call next middleware Auth successfull, access granted
  req.user = currUser;
  res.locals.user = currUser;
  next();
};

exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) {
    return next();
  }

  // 2) token verification
  const verify = promisify(JWT.verify);
  const decode = await verify(req.cookies.jwt, process.env.JWT_SECRET_KEY);

  // 3) check if user still exists
  const currUser = await User.findById(decode.id);
  if (!currUser) return next();

  // 4) check if user changed password after token was issued
  if (currUser.changedPasswordAfter(decode.iat)) return next();

  // 5) call next middleware Auth successfull, access granted
  res.locals.user = currUser;
  next();
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError('You are not authorized to perform this action', 403);

    next();
  };

exports.forgotPassword = async (req, res) => {
  // 1) get user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError('There is no user with this email adress', 404);

  // 2) generate a reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send it to users email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? send a PATCH request with your new password and confirm password to ${resetURL}.\nIf you didn't forget your password please ignore this email. `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (error) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('There was an error in sending the email', 500);
  }
};

exports.resetPassword = async (req, res) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token is not expired && user -> set new password
  if (!user) throw new AppError('Token is invalid or has expired', 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) update changedPasswordAt property for user
  await user.save();

  // 4) log user in, and send JWT
  createSendResponse(user, 200, res, false);
};

exports.updatePassword = async (req, res) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if current password is correct
  if (!(await user.isPasswordCorrect(req.body.passwordCurrent, user.password)))
    throw new AppError('The current Password is not correct', 403);

  // 3) update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in by sending JWT
  createSendResponse(user, 200, res, false);
};
