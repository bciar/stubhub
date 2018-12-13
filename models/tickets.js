// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var ticketsSchema = mongoose.Schema({
  eventID: String,
  date: String,
  primary: Number,
  resale: Number,
  total: Number,
  seats: []
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('ticketsModel', ticketsSchema);