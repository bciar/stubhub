// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var seatsSchema = mongoose.Schema({
  eventID: String,
  ticketID: String,
  date: String,
  section: String,
  sectionId: String,
  price: Number,
  row: String,
  quantity: Number,
  deliveryMethodList : [],
  deliveryTypeList: []
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('seatsModel', seatsSchema);