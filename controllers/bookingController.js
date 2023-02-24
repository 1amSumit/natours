const Tour = require('../models/toursModel');
const factory = require('../controllers/factoryController');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
//It will give stripe object after we pass api key
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);

exports.getChechoutSession = catchAsync(async (req, res, next) => {
  //1 Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2 Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'INR',
          unit_amount: tour.price * 1000,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  //3 Send it to client
  res.status(200).json({
    status: 'success',
    session,
  });
});
