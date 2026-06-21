const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourAndUserIds = (req, res, next) => {
  // these 2 if are for NESTED ROUTES
  if (!req.body.tour) {
    req.body.tour = req.params.tourId; // if tour not on body then must be in params i.e a nested route exsist
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);
