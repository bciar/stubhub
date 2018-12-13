// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../models/user');


module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('admin-login', new LocalStrategy({
        // by default, local strategy uses email and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'email' :  email , 'type' : 'admin', 'password': password }, function(err, user) {
                // if there are any errors, return the error
                
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (user.password != password)
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('admin-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        console.log("------------------------------dd---");
        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'email' :  email, 'type' : 'admin', 'password': password }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        var newUser            = new User();
                        newUser.email   = email;
                        newUser.password =  password;
                        newUser.type = 'admin';
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            } else if ( !req.user.email ) {
                User.findOne({ 'email' :  email, 'type' : 'admin', 'password': password }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        console.log("----------------------------------");
                        console.log(email);
                        var user = req.user;
                        user.email = email;
                        user.password = password;
                        user.type = 'admin';
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null,user);
                        });
                    }
                });
            } else {
                return done(null, req.user);
            }
        });

    }));    
};