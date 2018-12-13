// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var cookiesSchema = mongoose.Schema({
    cookies: String,
    sessionID: String
}, { timestamps: { createdAt: 'created_at' } });

// create the model for users and expose it to our app
module.exports = mongoose.model('CookiesModel', cookiesSchema);
