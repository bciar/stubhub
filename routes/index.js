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
router.post('/event/addSingle', isLoggedIn, main.addsingleEvent);

router.get('/event/:eventID/exportcsv', isLoggedIn, main.exportcsvSingle);

router.post('/event/:eventID/addFrequency', isLoggedIn, main.addFrequency);
router.post('/event/addFrequencies', isLoggedIn, main.addFrequencies);

router.post('/events/remove', isLoggedIn, main.removeEvents);
router.get('/getEventData/:eventID', isLoggedIn, main.getEventData);
router.get('/tickets/:eventID', isLoggedIn, main.ticketPage);
router.get('/viewEventDetails/:eventID', isLoggedIn, main.viewEventDetails);
router.get('/viewTicketDetails/:eventID', isLoggedIn, main.viewTicketDetails);

router.post('/viewActiveSeatDetails', isLoggedIn, main.viewActiveSeatDetails);
router.post('/viewSoldSeatDetails', isLoggedIn, main.viewSoldSeatDetails);



// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
