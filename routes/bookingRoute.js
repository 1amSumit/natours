const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const route = express.Router();

route.get(
  '/chechkout-session/:tourId',
  authController.protect,
  bookingController.getChechoutSession
);

module.exports = route;
