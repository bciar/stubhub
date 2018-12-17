// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var soldseatsSchema = mongoose.Schema({
  eventID: String,
  ticketID: String,
  quantity: Number,
  section: String,
  rows: String,
  deliveryOption: String,
  deliveryTypeId: Number,
  deliveryMethodId: Number,
  displayPricePerTicket: Number,
  stubhubMobileTicket: Number,
  sectionId: Number,
  transactionDate: String
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

// create the model for transaction and expose it to our app
module.exports = mongoose.model('soldseatsModel', soldseatsSchema);