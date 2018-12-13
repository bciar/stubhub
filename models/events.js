// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var eventsSchema = mongoose.Schema({
  id: String,
  eventID: String,
  name: String,
  url: String,
  image: String,
  artist: String,
  sales: {
    startDateTime: String,
    endDateTime: String
  },
  dates: {
    start: {
        localDate: String,
        localTime: String,
        dateTime: String
    },
    timezone: String
  },
  info: String,
  status: String,
  priceRange: {
      _type: String,
      currency: String,
      min: Number,
      max: Number
  },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String
  }

}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('eventsModel', eventsSchema);