const express = require('express');
const authController = require('../controllers/authController');
const reviewRoute = require('../routes/reviewsRoute');
// const app = require('../app');

const tourController = require('../controllers/toursController');

const route = express.Router();

//Nested Routes for review to get tour id and user id
route.use('/:tourId/reviews', reviewRoute);

// route.param('id', tourController.checkID);
route
  .route('/top-5-cheap')
  .get(tourController.aliasCheapTour, tourController.getAllTour);

route.route('/tour-stat').get(tourController.getTourStats);

route.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

route
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);

route
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = route;
