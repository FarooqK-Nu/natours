const Review = require('./../models/reviewModel');

exports.getAllReviews = async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter); // arr of all data

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
};

exports.createReview = async (req, res) => {
  // these 2 if are for NESTED ROUTES
  if (!req.body.tour) {
    req.body.tour = req.params.tourId; // if tour not on body then must be in params i.e a nested route exsist
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  const review = await Review.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
};
