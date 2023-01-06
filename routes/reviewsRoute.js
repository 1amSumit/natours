const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const express = require('express');
const route = express.Router();

route
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReviews
  );

module.exports = route;
