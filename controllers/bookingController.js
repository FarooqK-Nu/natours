const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = async (req, res) => {
  // 1) getting the tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) create a stripe session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',

    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // Stripe expects the smallest currency unit (e.g. cents)
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://natours.dev/img/tours/tour-1-cover.jpg'],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) send session to client
  res.status(200).json({
    status: 'success',
    session,
  });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
