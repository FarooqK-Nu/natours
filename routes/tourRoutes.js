const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// NESTED ROUTE
// POST /tour/id(2423353)/reviews -> POST to tour 2423353 a review
router.use('/:tourId/reviews', reviewRouter); //offload to review router cuz its a review req

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopFiveCheap, tourController.getAllTours);

router.route('/tour-stats').get(tourController.tourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.monthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getTourDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourPhoto,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour,
  );

module.exports = router;
