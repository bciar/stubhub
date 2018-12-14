// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var eventsSchema = mongoose.Schema({
  id: String,
  eventID: String,
  name: String,
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String
  },
  image: String,
  eventDate: String
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('eventsModel', eventsSchema);