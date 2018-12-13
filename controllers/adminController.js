var User = require('../models/user');
var nodemailer = require('nodemailer');
var ejs = require("ejs");

class adminController {

    constructor() {

    }

    index(req, res) {
        res.render('admin/main');
    }

    users(req, res) {
        User.find({}, (err, users) => {
            let nUsers = [];
            users.forEach(user => {
                if (user.type != 'admin') {
                    nUsers.push(user);
                }
            });
            res.render('admin/users', { users: nUsers });
        })
    }

    dashboard(req, res) {
        res.render('admin/dashboard');
    }

    setting(req, res) {
        res.render('admin/setting', {
            message: "",
            maintain: 0
        });

    }

    changepassword(req, res) {
        let password = req.body.password;
        let currentPassword = req.body.currentPassword;
        User.findOne({
            _id: req.user._id
        }, (err, user) => {
            if (err) {
                res.render("admin/setting", {
                    "message": "Something Error."
                });
            }
            if (user.password != currentPassword) {
                res.render("admin/setting", {
                    "message": "Current password is wrong."
                });
            } else {
                user.password = password;
                user.save((err) => {
                    res.redirect('/admin/users');
                })
            }


        })
    }

    sendinvitation(req, res) {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (user) {
                res.json({ status: 'error', message: 'This email is already existing.' });
            } else {
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.MAIL_SERVER_USER,
                        pass: process.env.MAIL_SERVER_PASSWORD
                    }
                });
                let password = Math.random().toString(36).substring(7);
                //save user in db

                let senddata = {
                    email: req.body.email,
                    password: password,
                    siteURL: process.env.PRODUCT_SERVER_URL
                }
                ejs.renderFile(process.cwd() + "/views/admin/invitation_email.ejs", { data: senddata }, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        let mailOptions = {
                            to: req.body.email,
                            subject: "Invitation to login ",
                            html: data
                        };
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.json({ status: 'error', message: 'sending email failed.' });
                            } else {
                                let nuser = new User();
                                nuser.email = req.body.email;
                                nuser.password = password;
                                nuser.type = 'user';
                                nuser.save((error) => {
                                    if (!error) {
                                        console.log('new user has been saved.')
                                    }
                                })
                                res.send({ status: 'success' });
                            }
                        });
                    }
                });
            }
        })

    }

    remove(req, res) {
        let id = req.params.id;
        User.deleteOne({_id: id}, (err, data) => {
            res.redirect('/admin/users');
        })
    }

}

module.exports = adminController;