const mongoose = require('mongoose');
const Tour = require('./toursModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Every tour has its review'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcRatingsAverage = async function (tourId) {
  const stat = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stat[0].avgRating,
    ratingsQuantity: stat[0].nRating,
  });
};

reviewSchema.post('save', function () {
  //Review is not defined here
  // Review.calcRatingsAverage(this.tour);

  //this.constructor also points to review model
  this.constructor.calcRatingsAverage(this.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//We dont have current document asses so we first have to find document and store it then to pass to calcRatingsAverage

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findone();
  //We can not use calcRatingsAverage(this.tour) as data is not update yet.
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //post does not have next
  await this.r.constructor.calcRatingsAverage(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
