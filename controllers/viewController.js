const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/toursModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'sign into your account',
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).render('user', { title: 'Your account' });
});

exports.getBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  console.log(bookings);

  const tourId = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourId } });

  res.status(200).render('overview', {
    title: 'Your bookings',
    tours,
  });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking ') res.locals.alert = 'Your booking was successfull!';

  next();
};
