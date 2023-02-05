const mongoose = require('mongoose');
const slugify = require('slugify');

const tourShema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name must required in tour.'],
      unique: true,
      trim: true,
      minlength: [10, 'Minimum length for tour name must be above 10'],
      maxlength: [40, 'Maximum length for tour name must be below 40'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    difficulty: {
      type: String,
      required: [true, 't tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A difficulty must be easy , medium or difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size.'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'rating must be above 1.0'],
      max: [5.0, 'rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'A discount price must be less than actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must a cover image'],
    },
    images: [String],
    createrdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//setting index for faster search query
//1 asscending order sord -1 descending order sort
tourShema.index({ price: 1, ratingsAverage: 1 });

tourShema.index({ slug: 1 });
tourShema.index({ startLocation: '2dsphere' });

tourShema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourShema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourShema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourShema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourShema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourShema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourShema);

module.exports = Tour;
