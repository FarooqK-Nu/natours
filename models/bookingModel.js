const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function () {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);
// Booking.create({
//   tour: '5c88fa8cf4afda39709c2955',
//   user: '5c8a1d5b0190b214360dc057',
//   price: 444,
// });

module.exports = Booking;
