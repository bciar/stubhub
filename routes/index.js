var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash = require('connect-flash');
var mainController = require('../controllers/mainController');
var adminController = require('../controllers/adminController');
var multer = require('multer');
var upload = multer({ dest: 'tmp/' });
var main = new mainController();
var admin = new adminController();

router.get('/', isLoggedIn, main.index);
router.get('/setting', isLoggedIn, main.setting);
router.post('/changepassword', isLoggedIn, main.changepassword);
//Authenticate
router.get('/login', (req, res) => { res.render('auth/login', { message: req.flash('loginMessage') }); });
router.get('/signup', (req, res) => { res.render('auth/signup', { message: req.flash('signupMessage') }); });
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  res.redirect('/login');
});

function isLoggedIn(req, res, next) {
  //check maintain
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.post('/events/uploadcsv', upload.single('file'), main.uploadcsv);
router.get('/getEventInternalDetails', main.getEventInternalDetails);
router.get('/saveTicketsPerDay', main.saveTicketsPerDay);
router.get('/saveSeatsOfTicketsPerDay', main.saveSeatsOfTicketsPerDay);

router.get('/loginStubhub', main.loginStubhub);
router.get('/loginTest', main.loginTest);

//////////////////////////////////////////////////////////////////  admin //////////////////////////////////////////////////////////////////

router.get('/admin/users', isAdminLoggedIn, admin.users);
router.get('/admin/dashboard', isAdminLoggedIn, admin.dashboard);
router.get('/admin/setting', isAdminLoggedIn, admin.setting);
router.post('/admin/changepassword', isAdminLoggedIn, admin.changepassword);
router.post('/admin/sendinvitation', isAdminLoggedIn, admin.sendinvitation);
router.get('/admin/remove/:id', isAdminLoggedIn, admin.remove);

router.get('/admin', isAdminLoggedIn, admin.index);
router.get('/admin/login', function (req, res) {
  res.render('admin/login', { message: req.flash('loginMessage') })
});

router.get('/admin/signup', function (req, res) {
  res.render('admin/signup', { message: req.flash('signupMessage') })
});

router.post('/admin/login', passport.authenticate('admin-login', {
  successRedirect: '/admin/users',
  failureRedirect: '/admin/login',
  failureFlash: true
}));
router.post('/admin/signup', passport.authenticate('admin-signup', {
  successRedirect: '/admin/login',
  failureRedirect: '/admin/signup',
  failureFlash: true
}));

function isAdminLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user.type == 'admin') {
    return next();
  } else {
    res.redirect('/admin/login');
  }
}

router.get('/admin/logout', function (req, res) {
  req.logout();
  res.redirect('/admin');
})


module.exports = router;
