const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const route = express.Router();

route.use(authController.protect);

route.get(
  '/chechkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

route.use(authController.restrictTo('admin', 'lead-guid'));

route
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

route
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = route;
