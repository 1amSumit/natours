const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const express = require('express');

const route = express.Router({ mergeParams: true });
route
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReviews
  );

route
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = route;
