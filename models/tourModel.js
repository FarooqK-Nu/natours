const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
// const validator = require('validator');
const pointSchema = require('./pointSchema');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour name is required'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Atour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: 5,
      min: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a tour price is required'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //arr of string

    createdAt: {
      type: Date,
      default: Date.now(), //mongose will automatically convert this timestamp to todays date
      select: false,
    },
    startDates: [Date],
    slug: String,
    startLocation: pointSchema.pointSchema,
    locations: [pointSchema.pointSchemaWithDay],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // refernceing the user doc
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: 'throw',
  },
);

tourSchema.virtual('durationInWeeks').get(function () {
  return Number((this.duration / 7).toFixed(2)); //think of it like adding this get method onto constructor of schema
});

// pre save hook
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true }); // we have access to this keyword
});

/* eslint-disable-next-line prefer-arrow-callback */
tourSchema.pre(/^find/, function () {
  // this.find({ secretTour: false });
});

// populating the guides
tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-_v -passwordChangedAt',
  });
});

/* eslint-disable-next-line prefer-arrow-callback */
tourSchema.pre('aggregate', function () {
  // this.pipeline().unshift({ $match: { secretTour: false } });
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
