// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    email: String,
    password: String,
    type: {
        default: 'user',
        type: String
    },
    token: String,
    expire: { type: Date, default: Date.now() + 600000 }
}, { timestamps: { createdAt: 'created_at' } });

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
