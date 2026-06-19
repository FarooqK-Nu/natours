const Review = require('./../models/reviewModel');

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find(); // arr of all data

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
};

exports.createReview = async (req, res) => {
  const review = await Review.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
};
