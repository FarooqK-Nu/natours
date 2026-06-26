const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Bookings = require('../models/bookingModel');
const AppError = require('../utils/appError');

exports.getOverview = async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    throw new AppError('There is no tour with that name.', 404);
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
};

exports.getMyTours = async (req, res) => {
  // 1) get all bookings for curr user
  const bookings = await Bookings.find({ user: req.user.id });
  const bookingIds = bookings.map((bk) => bk.tour);

  // 2) display the tours
  const tours = await Tour.find({ _id: { $in: bookingIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
};
