var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var engine = require('ejs-locals');
var router = require('./routes');
var passport = require('passport');
require('./config/passport')(passport);
require('./config/admin-passport')(passport);
var flash = require('connect-flash');
var session = require('express-session');
var CronJob = require('cron').CronJob;
var request = require('request');
var os = require("os");
var app = express();
require('dotenv').config();

const MONGOURL = process.env.MONGODB_URI || 'mongodb://localhost/stubhub';

mongoose.connect(MONGOURL, err => {
  console.error(err || `Connected to MongoDB: ${MONGOURL}`);
});

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({
  limit: '500mb', extended: true
}));
app.use(cookieParser());

app.use(express.static("public"));

//passport
app.use(session({
  secret: 'stubhub',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('404');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.auth_message = req.flash('AuthMessage');;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//cron
new CronJob('0 0 23 * * *', function () {
  console.log("running a task every midnight");
  request.get(process.env.PRODUCT_SERVER_URL + '/saveEvents', (err, response) => {
    console.log('saveEvents')
    request.get(process.env.PRODUCT_SERVER_URL + '/saveTickets', (err, response) => {
      console.log('saveTickets')
    })
  })
}, null, true, 'America/New_York');
module.exports = app;
