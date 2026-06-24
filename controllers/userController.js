// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

// handing imgs with multer

const getFilteredObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];

    return newObj;
  });
};

exports.getME = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// user handlers
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update passwords with this! no Mongoose validation prob
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined! Please use /signup instead',
  });
};

exports.updateMe = async (req, res) => {
  // 1) show error if user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    throw new AppError(
      'This page is not for updating the password , kindly visit change Password page /updateMyPassword',
      400,
    );

  // 2) filter out those fields that user is not allowed to set
  const filteredObj = getFilteredObj(req.body, ['name', 'email']);

  // 3) update the user data
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
