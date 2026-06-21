const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Parent referenceing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // setting virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// HOOKS

// populating the review data
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name _id',
  });
  //   .populate({
  //     path: 'tour',
  //     select: 'name _id',
  //   });
});

// Static method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', //grp by tour
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post(/save|^findOne/, async (doc) => {
  if (doc) {
    // eslint-disable-next-line no-use-before-define
    await Review.calcAverageRatings(doc.tour); //doc.tour has id of the tour
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
