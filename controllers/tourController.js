// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(
      new AppError('Not an image!. Please upload an image only', 400),
      false,
    );
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  // we will parse 2 fields of files
  { name: 'imageCover', maxCount: 1 }, // 1 img
  { name: 'images', maxCount: 3 }, // 3 images [arr]
]);

exports.resizeTourPhoto = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`; // will be added to DB in nxt MW

  // 1) cover Image

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`); // path where this new img is saved

  // 2) images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`; // will be added to DB in nxt MW

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );
  next();
};

exports.aliasTopFiveCheap = (req, res, next) => {
  req.queryObj = {
    // cuz req.query is now getter (immutable on spot)
    ...req.query,
    limit: '5',
    sort: 'price,ratingsAverage',
  };
  // console.log(req.queryObj);
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

exports.getToursWithin = async (req, res) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : 6378.1;

  if (!lat || !lng)
    throw new AppError(
      'Please provide latitude and langitude in format lat,lng',
      400,
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
};

exports.getTourDistances = async (req, res) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    throw new AppError(
      'Please provide latitude and langitude in format lat,lng',
      400,
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
};
