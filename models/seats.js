// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var seatsSchema = mongoose.Schema({
  eventID: String,
  date: String,
  section: String,
  price: String,
  rows: String,
  quantity: String,
  deliveryMethodList : []
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('seatsModel', seatsSchema);