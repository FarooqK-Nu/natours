const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
