var eventsModel = require('../models/events');
var ticketsModel = require('../models/tickets');
var seatsModel = require('../models/seats');
var User = require('../models/user');
var stringify = require('csv-stringify');
var csv = require('fast-csv');
var fs = require('fs');
var stubhubApi = require('../apis/stubhubApi');
var stubhub = new stubhubApi();
var cheerio = require('cheerio');

class mainController {
    constructor() { }

    index(req, res) {
        eventsModel.find({}, (err, data) => {
            res.render('home', { events: data });
        })
    }

    uploadcsv(req, res) {
        const fileRows = [];

        // open uploaded file
        csv.fromPath(req.file.path)
            .on("data", function (data) {
                fileRows.push(data); // push each row
            })
            .on("end", function () {
                let count = 0;
                fileRows.forEach(eventID => {
                    let newEvent = new eventsModel();
                    eventsModel.find({ eventID: eventID }, (err, data) => {
                        if (data.length == []) {
                            newEvent.eventID = eventID;
                            newEvent.save((err) => {
                                count++;
                                if (count == fileRows.length) res.redirect('/');
                            });
                        } else {
                            count++;
                            if (count == fileRows.length) res.redirect('/');
                        }
                    })

                });
                fs.unlinkSync(req.file.path);   // remove temp file
            })
    }

    addsingleEvent(req, res) {
        let eventID = req.body.eventID;
        eventsModel.find({ eventID: eventID }, (err, data) => {
            if (data.length == []) {
                newEvent.eventID = eventID;
                newEvent.save((err) => {
                    res.redirect('/');
                });
            } else {
                res.redirect('/');
            }
        })
    }

    ticketPage(req, res) {
        let eventID = req.params.eventID;
        eventsModel.findOne({ eventID: eventID }, (err, event) => {
            if (err) res.redirect('/');
            if (event) {
                ticketsModel.find({ eventID: eventID }, (err2, tickets) => {
                    if (err2) res.redirect('/');
                    if (tickets) {
                        res.render('tickets', { event: event, tickets: tickets });
                    }
                })
            }
        })
    }

    viewEventDetails(req, res) {
        let eventID = req.params.eventID;
        eventsModel.findOne({ eventID: eventID }, (err, event) => {
            if (err) res.json({ status: 'failed', data: [] });
            if (event) {
                res.json({ status: 'success', data: event });
            }
        })
    }

    viewTicketDetails(req, res) {
        let eventID = req.params.eventID;
        ticketsModel.find({ eventID: eventID }, (err, tickets) => {
            if (err) res.json({ status: 'failed', data: [] });
            if (tickets) {
                res.json({ status: 'success', data: tickets });
            }
        })
    }

    viewSeatDetails(req, res) {
        let eventID = req.body.eventID;
        let date = req.body.date;
        seatsModel.find({ eventID: eventID, date: date }, (err, seats) => {
            if (err) {
                res.json({ status: 'failed', data: [] });
            }
            else {
                res.json({ status: 'success', data: seats });
            }
        })
    }

    setting(req, res) {
        res.render('setting', { message: '' });
    }

    changepassword(req, res) {
        let password = req.body.password;
        let currentPassword = req.body.currentPassword;
        User.findOne({
            _id: req.user._id
        }, (err, user) => {
            if (err) {
                res.render("setting", {
                    "message": "Something Error."
                });
            }
            if (user.password != currentPassword) {
                res.render("setting", {
                    "message": "Current password is wrong."
                });
            } else {
                user.password = password;
                user.save((err) => {
                    res.redirect('/events');
                })
            }
        })
    }

    async loginStubhub(req, res) {
        let response = await siteLogin();
        res.send(response);
    }

    async loginTest(req, res) {
        let siteHTML = await stubhub.openSite();
        if (siteHTML.indexOf('dCF_ticket') > 0) {
            const $ = cheerio.load(siteHTML);
            let url = $('#distilCaptchaForm').attr('action');
            // let dCF_ticket = $('#dCF_ticket').attr('value');
            let dCF_ticket = '1.0&CFAEk9aQXF+Cp/EZ4BTfAqf12oDEAcQ5NjRrROnDjpsGTU0TqU6doyl+IRigbP9PQIjFjj00ILp4SYSBrjCZLTFo3fNrJNV5AHBAYlleVmFBRvfVRqEwQsruhJJijfjCe2XpqCzZZk+X5dxu1JOygucKyGPqRIg/1mZh3lK46xI=';
            let g_recaptcha_response = '03AO9ZY1DTx2pvfjHSibT07HanDGiaanDrruRTialjKfhkzoH7rtfr3RmWZpluTRAmGJPIQ9Q3jOeQv-VTavVJ7N0qaTr4e2FEjm1rqUcyUYAL3s-THm4Ir14a-RVDov0pztfkdEFLYl_agF4Ver-BPSY2jRrbVyPjEQNWUeVRZjxQOCEuuFf9r4p3tJzweZk87U0SKfqZQ7sAX3xFdAB6gHRUTjoHNJrHwvV5qwD7v-PG4SicSDg3kjr55lZCKI7_dk2ciqcAexTSAYlQT2S_PY8E457kBl_UXeLJz82q0CI53bef1cu0l8dP3JhJC5Zav7m0tksck3I8';
            let hh = await stubhub.sendRecapcha(url, dCF_ticket, g_recaptcha_response);
            let newsiteHTML = await stubhub.openSite();
            res.send(hh);
        } else {
            let loginStatus = await stubhub.Testlogin();
            res.send(loginStatus);
        }

    }

    async saveActiveTickets(req, res) {
        eventsModel.find({}, (err, events) => {
            events.forEach(event => {
                stubhub.getActiveTicketsById(event.eventID, 0, 25).then((eventData) => {
                    if (eventData && eventData.eventId == event.eventID) {
                        var nowDate = new Date().toLocaleString('en-US', {
                            timeZone: 'America/New_York'
                        });
                        let date = new Date(nowDate);
                        let rdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                        ticketsModel.deleteMany({ eventID: event.eventID, date: rdate }, (err, data) => {
                            let ticketObject = new ticketsModel();
                            ticketObject.eventID = event.eventID;
                            ticketObject.date = rdate;
                            ticketObject.totalListings = eventData.totalListings;
                            ticketObject.totalTickets = eventData.totalTickets;
                            ticketObject.minTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.minTicketPriceWithCurrency.amount : '';
                            ticketObject.maxTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.maxTicketPriceWithCurrency.amount : '';
                            ticketObject.averageTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.averageTicketPriceWithCurrency.amount : '';
                            ticketObject.medianTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.medianTicketPriceWithCurrency.amount : '';
                            ticketObject.save((err) => { console.log('ticket infor saved at ' + rdate + ' of ' + event.eventID) });
                        })

                    }
                })

            });

        })
        res.send("ok");
    }

    async saveSoldTickets(req, res) {

    }

    async saveSeatsOfActiveEvents(req, res) {
        var nowDate = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York'
        });
        var date = new Date(nowDate);
        var rdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        ticketsModel.find({ date: rdate }, (err, tickets) => {
            tickets.forEach(ticket => {
                let totalListings = ticket.totalListings;
                if (totalListings > 0) {
                    let nums = Math.floor(totalListings / 200) + 1;
                    let rows = 200;
                    for (let i = 0; i < nums; i++) {
                        let start = i * rows;
                        if (start + rows > totalListings) rows = totalListings - start;
                        stubhub.getActiveTicketsById(ticket.eventID, start, rows).then((ticketData) => {
                            if (ticketData) {
                                ticketData.listing.forEach(list => {
                                    let seatObject = new seatsModel();
                                    seatObject.eventID = ticket.eventID;
                                    seatObject.section = list.sectionName;
                                    seatObject.price = list.currentPrice.amount;
                                    seatObject.row = list.row;
                                    seatObject.quantity = list.quantity;
                                    seatObject.date = rdate;
                                    seatObject.deliveryMethodList = list.deliveryMethodList;
                                    seatObject.deliveryTypeList = list.deliveryTypeList;
                                    seatObject.save((err) => { console.log('seat details saved') })
                                });
                            }
                        })
                            .catch((err) => {
                            })
                    }
                }

            });

        })
        res.send('ok');
    }

    async getEventInternalDetails(req, res) {
        eventsModel.find({}, (err, events) => {
            events.forEach(event => {
                stubhub.getEventInternalDetails(event.eventID).then((eventData) => {
                    if (eventData && event.eventID == eventData.id) {
                        event.name = (eventData.name) ? eventData.name : '';
                        event.venue.name = (eventData.venue && eventData.venue.name) ? eventData.venue.name : '';
                        event.venue.address = (eventData.venue && eventData.venue.address) ? eventData.venue.address1 : '';
                        event.venue.city = (eventData.venue && eventData.venue.locality) ? eventData.venue.locality : '';
                        event.venue.state = (eventData.venue && eventData.venue.state) ? eventData.venue.state : '';
                        event.venue.country = (eventData.venue && eventData.venue.country) ? eventData.venue.country : '';
                        event.image = (eventData.images) ? eventData.images[0].url : '';
                        event.eventDate = (eventData.eventDateUTC) ? eventData.eventDateUTC : '';
                        event.save((err) => { console.log('event datail saved') });
                    }
                })

            });

        })
        res.send('ok');
    }

}

async function siteLogin() {
    let loginStatus = await stubhub.checkLogin();
    if (loginStatus == false) {
        console.log('new Logging')
        await stubhub.openSite();
        let response = await stubhub.login();
        return response;
    } else return 'Loggedin';
}


module.exports = mainController;