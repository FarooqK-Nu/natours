const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Factory deleteOne Controller
exports.deleteOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    throw new AppError('No Document found which this ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.updateOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // so that new doc will be returned as a resolved promise
    runValidators: true,
  });

  if (!doc) {
    throw new AppError('Documnet not found which this ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

exports.createOne = (Model) => async (req, res) => {
  const doc = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: doc,
    },
  });
};

exports.getOne = (Model, populateOptions) => async (req, res) => {
  let query = await Model.findById(req.params.id);
  if (populateOptions) query = query.populate(populateOptions);
  const doc = await query;

  if (!doc) {
    throw new AppError('Tour not found which this ID', 404);
  }

  res.status(200).json({
    status: 'successful',
    data: {
      data: doc,
    },
  });
};

exports.getAll = (Model) => async (req, res) => {
  // to allow nested GET reviews on tour
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const querySource = req.queryObj || req.query; //(req.queryObj will be selected if we hit /top-5-cheap only)

  // Execute query
  const features = new APIFeatures(Model.find(filter), querySource)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  //send response
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  });
};
