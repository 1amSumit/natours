const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);
const Tour = require('../models/toursModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'INR',
          unit_amount: tour.price,
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

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async (session) => {
  console.log(session);
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 1000;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const payload = {
    id: 'evt_test_webhook',
    object: 'event',
  };

  const payloadString = JSON.stringify(payload, null, 2);
  const secret = 'whsec_test_secret';
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.SNIPING_STRIPE_SECRET
    );

    console.log(event);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  console.log(event.type);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
