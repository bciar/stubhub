// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var ticketsSchema = mongoose.Schema({
  eventID: String,
  date: String,
  totalListings: Number,
  totalTickets: Number,
  minTicketPrice: Number,
  maxTicketPrice: Number,
  averageTicketPrice: Number,
  medianTicketPrice: Number
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('ticketsModel', ticketsSchema);