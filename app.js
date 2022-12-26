const express = require('express');

const app = express();
const morgan = require('morgan');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

//Routing

//using as middleware
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
//handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//express middleware for error handling
app.use(errorController.errorHandler);

module.exports = app;
