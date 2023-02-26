const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');

const app = express();

const toursRouter = require('./routes/tourRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookigRoute = require('./routes/bookingRoute');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewsRoute');
const AppError = require('./utils/appError');
const bookingController = require('./controllers/bookingController');
const errorController = require('./controllers/errorController');

// app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

app.enable('trust proxy');

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too mant requests with this IP, please try again in an hour.',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Routing

app.use('/api', limiter);

//using as middleware

// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

app.use('/', viewRoutes);

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/booking', bookigRoute);

//handling unhandled routes

app.options('*', cors());
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//express middleware for error handling
app.use(errorController.errorHandler);

module.exports = app;
