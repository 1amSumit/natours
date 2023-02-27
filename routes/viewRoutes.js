const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewController.alerts);

router.get('/', authController.isLogedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLogedIn, viewController.getTour);
router.get('/login', authController.isLogedIn, viewController.login);
router.get('/signup', authController.isLogedIn, viewController.signup);
router.get('/me', authController.protect, viewController.getMe);
router.get('/bookings', authController.protect, viewController.getBookings);

module.exports = router;
