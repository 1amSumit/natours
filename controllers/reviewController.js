const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factoryController = require('../controllers/factoryController');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReviews = factoryController.createOne(Review);

exports.updateReview = factoryController.updateOne(Review);
exports.deleteReview = factoryController.deleteOne(Review);
