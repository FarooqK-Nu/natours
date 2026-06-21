const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopFiveCheap = (req, res, next) => {
  req.queryObj = {
    // cuz req.query is now getter (immutable on spot)
    ...req.query,
    limit: '5',
    sort: 'price,ratingsAverage',
  };
  console.log(req.queryObj);
  next();
};

exports.getAllTours = async (req, res) => {
  const querySource = req.queryObj || req.query; //(req.queryObj will be selected if we hit /top-5-cheap only)

  // Execute query
  const features = new APIFeatures(Tour.find(), querySource)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // Tour.findOne({ _id: req.params.id })
  if (!tour) {
    throw new AppError('Tour not found which this ID', 404);
  }

  res.status(200).json({
    status: 'successful',
    data: {
      tour,
    },
  });
};

exports.createTour = async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // so that new doc will be returned as a resolved promise
    runValidators: true,
  });

  if (!tour) {
    throw new AppError('Tour not found which this ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.deleteTour = async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    throw new AppError('Tour not found which this ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: tour,
  });
};

exports.tourStats = async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
};

exports.monthlyPlan = async (req, res) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  //generate response
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
};
