var eventsModel = require('../models/events');
var ticketsModel = require('../models/tickets');
var seatsModel = require('../models/seats');
var soldseatsModel = require('../models/soldseats');
var User = require('../models/user');
var stringify = require('csv-stringify');
var csv = require('fast-csv');
var fs = require('fs');
var stubhubApi = require('../apis/stubhubApi');
var stubhub = new stubhubApi();
var cheerio = require('cheerio');
var request = require('request');
var PolynomialRegression = require('ml-regression').PolynomialRegression;

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
                    eventsModel.find({ eventID: eventID }, async (err, data) => {
                        if (data.length == []) {
                            await updateEventInfo(eventID);
                            count++;
                            if (count == fileRows.length) res.redirect('/');
                        } else {
                            count++;
                            if (count == fileRows.length) res.redirect('/');
                        }
                    })

                });
                fs.unlinkSync(req.file.path);   // remove temp file
            })
    }

    removeEvents(req, res) {
        let eventIDs = JSON.parse(req.body.eventIDs);
        let i = 0;
        let count = eventIDs.length;
        eventIDs.forEach(eventID => {
            eventsModel.deleteMany({ eventID: eventID }, (err, data) => {
                ticketsModel.deleteMany({ eventID: eventID }, (err2, data2) => {
                    soldseatsModel.deleteMany({ eventID: eventID }, (err3, data3) => {
                        i++;
                        if (i == count) res.send('ok');
                    })
                })
            })
        });
    }

    comparePage(req, res) {
        let data = JSON.parse(req.query.eventIDs);
        let eventIDs = data.eventIDs;
        let ticketDatas = [];
        let eventDatas = [];
        let i = 0;
        let index = 0;
        let dates = [];
        eventIDs.forEach(eventID => {
            eventsModel.findOne({ eventID, eventID }, (err, eventData) => {
                eventDatas.push(eventData);
                ticketsModel.find({ eventID, eventID }, (err, ticketData) => {
                    i++;
                    // ticketDatas.push(ticketData);
                    ticketData.eventDate = eventData.eventDate;
                    ticketData.forEach(ticket => {
                        if (!dates.includes(ticket.datetime) && ticket.datetime.includes('7:00:00 PM')) {
                            dates.push(ticket.datetime);
                        }
                        ticket.eventDate = eventData.eventDate;
                        ticketDatas.push(ticket);
                    });
                    if (i == eventIDs.length) {
                        //sort dates
                        for (let j = 0; j < dates.length; j++) {
                            for (let k = j + 1; k < dates.length; k++) {
                                let d1 = new Date(dates[j]);
                                let d2 = new Date(dates[k]);
                                if (d1 > d2) {
                                    let tmp = dates[k];
                                    dates[k] = dates[j];
                                    dates[j] = tmp;
                                }
                            }
                        }
                        //filter data ticketDatas
                        let result_data = [];
                        dates.forEach(rdate => {
                            let result_item = {
                                datetime: rdate,
                                events: []
                            };
                            eventIDs.forEach(reventID => {
                                let result_item_row = {
                                    eventID: reventID,
                                    ticket: null
                                };
                                ticketDatas.forEach(reventData => {
                                    if (reventData.datetime == rdate && reventData.eventID == reventID) {
                                        result_item_row.ticket = reventData;
                                    }
                                });
                                result_item.events.push(result_item_row);
                            });
                            result_data.push(result_item);
                        });

                        //calc days to event data

                        let daysArray = [];
                        dates.forEach(rdate => {
                            eventDatas.forEach(reventData => {
                                let date1 = new Date(reventData.eventDate);
                                let date2 = new Date(rdate);
                                let timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                let diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                                if (!daysArray.includes(diffDays)) {
                                    daysArray.push(diffDays);
                                }
                            });
                        });
                        //sort daysArray
                        daysArray.sort();
                        daysArray.reverse();

                        let result_days_data = [];
                        daysArray.forEach(days => {
                            let result_item = {
                                days: days,
                                events: []
                            };
                            eventIDs.forEach(reventID => {
                                let result_item_row = {
                                    eventID: reventID,
                                    ticket: null
                                };
                                ticketDatas.forEach(reventData => {
                                    //calc days
                                    let date1 = new Date(reventData.eventDate);
                                    let date2 = new Date(reventData.datetime);
                                    let timeDiff = Math.abs(date2.getTime() - date1.getTime());
                                    let diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                                    if (diffDays == days && reventData.eventID == reventID) {
                                        result_item_row.ticket = reventData;
                                    }
                                });
                                result_item.events.push(result_item_row);
                            });
                            result_days_data.push(result_item);
                        });

                        res.render('compare', { data: result_data, eventIDs: eventIDs, eventData: eventDatas, days_data: result_days_data });

                    }

                })
            })

        });

    }

    comparePageJSON(req, res) {
        let data = JSON.parse(req.query.eventIDs);
        let eventIDs = data.eventIDs;
        let eventDatas = [];
        let i = 0;
        let index = 0;
        let dates = [];
        eventIDs.forEach(eventID => {
            ticketsModel.find({ eventID, eventID }, (err, ticketData) => {
                i++;
                // eventDatas.push(ticketData);
                ticketData.forEach(ticket => {
                    if (!dates.includes(ticket.datetime) && ticket.datetime.includes('7:00:00 PM')) {
                        dates.push(ticket.datetime);
                    }
                    eventDatas.push(ticket);
                });
                if (i == eventIDs.length) {
                    //sort dates
                    for (let j = 0; j < dates.length; j++) {
                        for (let k = j + 1; k < dates.length; k++) {
                            let d1 = new Date(dates[j]);
                            let d2 = new Date(dates[k]);
                            if (d1 > d2) {
                                let tmp = dates[k];
                                dates[k] = dates[j];
                                dates[j] = tmp;
                            }
                        }
                    }
                    //filter data eventdatas
                    let result_data = [];
                    dates.forEach(rdate => {
                        let result_item = {
                            datetime: rdate,
                            events: []
                        };
                        eventIDs.forEach(reventID => {
                            let result_item_row = {
                                eventID: reventID,
                                ticket: null
                            };
                            eventDatas.forEach(reventData => {
                                if (reventData.datetime == rdate && reventData.eventID == reventID) {
                                    result_item_row.ticket = reventData;
                                }
                            });
                            result_item.events.push(result_item_row);
                        });
                        result_data.push(result_item);
                    });
                    // console.log(result_data)
                    //get event data
                    res.json({ data: result_data, eventIDs: eventIDs });

                }

            })
        });
    }

    predictPage(req, res) {
        res.render('predict');
    }

    async addsingleEvent(req, res) {
        let eventID = req.body.eventID;
        eventsModel.find({ eventID: eventID }, async (err, data) => {
            if (data.length == []) {
                //call api to save event information and save tickets
                await updateEventInfo(eventID);
                res.redirect('/');
            } else {
                res.redirect('/');
            }
        })
    }

    getEventIDs(req, res) {
        eventsModel.find({}, (err, events) => {
            let eventIDs = [];
            events.forEach(event => {
                eventIDs.push(event.eventID);
            });
            res.json({ eventIDs: eventIDs });
        })
    }

    searchResult(req, res) {
        let eventIDs = req.query.eventID;
        let i = 0;
        let result = [];
        if (eventIDs) {
            eventIDs.forEach(eventID => {
                eventsModel.findOne({ eventID: eventID }, (err, event) => {
                    i++;
                    result.push(event);
                    if (i == eventIDs.length) {
                        res.render('home', { events: result });
                    }
                })
            });
        } else {
            eventsModel.find({}, (err, data) => {
                res.render('home', { events: data });
            })
        }
    }

    exportcsvSingle(req, res) {
        let eventID = req.params.eventID;
        var data = [];
        data.push(["Event ID", "Timestamp", "Total Listings", "Total Tickets", "minTicketPrice", "averageTicketPrice", "medianTicketPrice", "Sold", "Sold Volume"]);
        ticketsModel.find({ eventID: eventID }, (err, tickets) => {
            let count = 0;
            tickets.forEach(ticket => {
                soldseatsModel.find({ ticketID: ticket._id }, (err, seats) => {
                    let volume = 0;
                    if (seats.length > 0) {
                        seats.forEach(seat => {
                            volume = volume + seat.displayPricePerTicket * seat.quantity;
                        });
                    }
                    count++;
                    let row = [ticket.eventID, ticket.datetime, ticket.totalListings, ticket.totalTickets, ticket.minTicketPrice, ticket.averageTicketPrice, ticket.medianTicketPrice, ticket.soldNum, volume];
                    data.push(row);
                    if (count == tickets.length) {
                        /////
                        //add sold seats info
                        data.push([" ", " ", " ", " ", " ", " ", " ", " "]);
                        data.push(["section", "price", "rows", "quantity", "delivery", "transactionDate", " ", " ", " "]);
                        soldseatsModel.find({ eventID: eventID, ticketID: ticket._id }, (err, seats) => {
                            if (seats && seats.length > 0) {
                                seats.forEach(seat => {
                                    var seatdate = new Date(seat.transactionDate).toLocaleString('en-US', {
                                        timeZone: 'America/New_York'
                                    });
                                    let row = [seat.section, seat.displayPricePerTicket, seat.rows, seat.quantity, seat.deliveryOption, seatdate, "", "", ""];
                                    data.push(row);
                                });
                            }
                            downloadF(data, res, 'stubhub' + eventID);
                        })
                        /////
                    }
                })

            });


        })
    }

    addFrequency(req, res) {
        let eventID = req.params.eventID;
        let data = req.body;
        let frequencies = [];
        if (!Array.isArray(data.start_date)) data.start_date = [data.start_date];
        if (!Array.isArray(data.end_date)) data.end_date = [data.end_date];
        if (!Array.isArray(data.frequency)) data.frequency = [data.frequency];
        for (let i = 0; i < data.start_date.length; i++) {
            let start_date = data.start_date[i];
            let end_date = data.end_date[i];
            let frequency = data.frequency[i];
            let cstart = new Date(start_date);
            let cend = new Date(end_date);
            if (cstart <= cend) {
                //save to db;
                frequencies.push(
                    {
                        start: start_date,
                        end: end_date,
                        frequency: frequency
                    }
                );
            }
        }
        if (frequencies.length > 0) {
            eventsModel.findOne({ eventID: eventID }, (err, event) => {
                event.pullFrequency.ftype = 2;
                event.pullFrequency.frequencies = frequencies;
                event.save((err) => {
                    res.redirect('/');
                });
            })
        } else {
            eventsModel.findOne({ eventID: eventID }, (err, event) => {
                event.pullFrequency.ftype = 1;
                event.pullFrequency.frequencies = [];
                event.save((err) => {
                    res.redirect('/');
                });
            })
        }

    }

    addFrequencies(req, res) {
        let eventIDs = JSON.parse(req.body.multipleFrequencies);
        let data = req.body;
        let frequencies = [];
        if (!Array.isArray(data.start_date)) data.start_date = [data.start_date];
        if (!Array.isArray(data.end_date)) data.end_date = [data.end_date];
        if (!Array.isArray(data.frequency)) data.frequency = [data.frequency];
        for (let i = 0; i < data.start_date.length; i++) {
            let start_date = data.start_date[i];
            let end_date = data.end_date[i];
            let frequency = data.frequency[i];
            let cstart = new Date(start_date);
            let cend = new Date(end_date);
            if (cstart <= cend) {
                //save to db;
                frequencies.push(
                    {
                        start: start_date,
                        end: end_date,
                        frequency: frequency
                    }
                );
            }
        }

        if (frequencies.length > 0) {
            let count = 0;
            eventIDs.forEach(eventID => {
                eventsModel.findOne({ eventID: eventID }, (err, event) => {
                    event.pullFrequency.ftype = 2;
                    event.pullFrequency.frequencies = frequencies;
                    event.save((err) => {
                        count++;
                        if (count == eventIDs.length)
                            res.redirect('/');
                    });
                })
            });

        } else {
            let count = 0;
            eventIDs.forEach(eventID => {
                eventsModel.findOne({ eventID: eventID }, (err, event) => {
                    event.pullFrequency.ftype = 1;
                    event.pullFrequency.frequencies = [];
                    event.save((err) => {
                        count++;
                        if (count == eventIDs.length)
                            res.redirect('/');
                    });
                })
            });
        }



    }

    getEventData(req, res) {
        let eventID = req.params.eventID;
        eventsModel.findOne({ eventID: eventID }, (err, event) => {
            res.json(event);
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

    getTicketInfo(req, res) {
        let eventID = req.params.eventID;
        ticketsModel.find({ eventID: eventID }, (err2, tickets) => {
            if (err2) res.json({});
            res.json(tickets);
        })
    }

    getTicketInfo_Prediction(req, res) {
        let eventID = req.params.eventID;
        ticketsModel.find({ eventID: eventID }, (err2, tickets) => {
            if (err2) res.json({});
            let timestamps = [];
            let medianPrices = [];
            let result = [];
            tickets.forEach(ticket => {
                result.push(
                    {
                        datetime: ticket.datetime,
                        medianPrice: ticket.medianTicketPrice,
                        type: 0
                    }
                );
            });
            tickets.forEach(ticket => {
                let date = new Date(ticket.datetime);
                let timestamp = date.getTime() / 1000 + 5 * 3600;
                let medianPrice = ticket.medianTicketPrice;
                timestamps.push(timestamp);
                medianPrices.push(medianPrice);
            });
            if (timestamps.length > 3) {
                let len = timestamps.length;
                let delta = timestamps[len - 1] - timestamps[len - 2];
                let nextTimestamp1 = timestamps[len - 1] + delta;
                let nextTimestamp2 = nextTimestamp1 + delta;
                let nextTimestamp3 = nextTimestamp2 + delta;
                try {
                    //predict
                    var degree = 4; // setup the maximum degree of the polynomial
                    var regression = new PolynomialRegression(timestamps, medianPrices, degree);
                    let predictPrice1 = regression.predict(nextTimestamp1);
                    let predictPrice2 = regression.predict(nextTimestamp2);
                    let predictPrice3 = regression.predict(nextTimestamp3);
                    result.push(
                        {
                            datetime: new Date(nextTimestamp1 * 1000).toLocaleString('en-US', {
                                timeZone: 'America/New_York'
                            }),
                            medianPrice: Math.floor(predictPrice1 * 100) / 100,
                            type: 1
                        }
                    );
                    result.push(
                        {
                            datetime: new Date(nextTimestamp2 * 1000).toLocaleString('en-US', {
                                timeZone: 'America/New_York'
                            }),
                            medianPrice: Math.floor(predictPrice2 * 100) / 100,
                            type: 1
                        }
                    );
                    result.push(
                        {
                            datetime: new Date(nextTimestamp3 * 1000).toLocaleString('en-US', {
                                timeZone: 'America/New_York'
                            }),
                            medianPrice: Math.floor(predictPrice3 * 100) / 100,
                            type: 1
                        }
                    );
                }
                catch (e) {
                    console.log(e)
                }


                res.json(result);
            } else {
                res.json(result);
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

    viewActiveSeatDetails(req, res) {
        let ticketID = req.body.ticketID;
        seatsModel.find({ ticketID: ticketID }, (err, seats) => {
            if (err) {
                res.json({ status: 'failed', data: [] });
            }
            else {
                res.json({ status: 'success', data: seats });
            }
        })
    }

    viewSoldSeatDetails(req, res) {
        let ticketID = req.body.ticketID;
        soldseatsModel.find({ ticketID: ticketID }, (err, seats) => {
            if (err) {
                res.json({ status: 'failed', data: [] });
            }
            else {
                res.json({ status: 'success', data: seats });
            }
        })
    }

    viewSoldSeatDetailsByFilter(req, res) {
        let rdata = JSON.parse(req.body.data);
        let ticketID = rdata.ticketID;
        let rfilters = rdata.filters;
        let filters = [];
        rfilters.forEach(element => {
            filters.push(parseInt(element, 10));
        });
        soldseatsModel.find({ ticketID: ticketID }, (err, seats) => {
            if (err) {
                res.json({ status: 'failed', data: [] });
            }
            else if (filters.length == 0) {
                res.json({ status: 'ok', data: seats });
            } else {
                let result_data = [];
                seats.forEach(seat => {
                    if (filters.includes(seat.sectionId)) {
                        result_data.push(seat);
                    }
                });
                res.json({ status: 'ok', data: result_data });
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
            console.log('google captcha')
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

    async saveTickets(req, res) {
        let nowDateTime = req.query.datetime;
        eventsModel.find({}, (err, events) => {
            events.forEach(event => {
                stubhub.getActiveTicketsById(event.eventID, 0, 25).then((eventData) => {
                    if (eventData && eventData.eventId == event.eventID) {
                        let ticketObject = new ticketsModel();
                        ticketObject.eventID = event.eventID;
                        ticketObject.datetime = nowDateTime;
                        ticketObject.totalListings = eventData.totalListings;
                        ticketObject.totalTickets = eventData.totalTickets;
                        ticketObject.minTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.minTicketPriceWithCurrency.amount : '';
                        ticketObject.maxTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.maxTicketPriceWithCurrency.amount : '';
                        ticketObject.averageTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.averageTicketPriceWithCurrency.amount : '';
                        ticketObject.medianTicketPrice = (eventData.pricingSummary) ? eventData.pricingSummary.medianTicketPriceWithCurrency.amount : '';
                        ticketObject.save((err) => {
                            // console.log('ticket infor saved at ' + nowDateTime + ' of ' + event.eventID);
                            if (!err) {
                                saveSeatsOfActiveTickets(ticketObject);
                                saveSeatsofSoldTickets(ticketObject);
                            }
                        });
                    }
                })

            });

        })
        res.send("ok");
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
                        event.save(
                            // (err) => { console.log('event datail saved') }
                        );
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

function saveSeatsOfActiveTickets(ticket) {
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
                        seatObject.sectionId = list.sectionId;
                        seatObject.zoneId = list.zoneId;
                        seatObject.zone = list.zone;
                        seatObject.ticketID = ticket._id;
                        seatObject.price = list.currentPrice.amount;
                        seatObject.row = list.row;
                        seatObject.quantity = list.quantity;
                        seatObject.date = ticket.datetime;
                        seatObject.deliveryMethodList = list.deliveryMethodList;
                        seatObject.deliveryTypeList = list.deliveryTypeList;
                        seatObject.save(
                            // (err) => { console.log('seat details saved') }
                        )
                    });
                }
            })
                .catch((err) => {
                })
        }
    }
}

function saveSeatsofSoldTickets(ticket) {
    stubhub.getSoldTicketsById(ticket.eventID).then((ticketData) => {
        if (ticketData) {
            ticket.soldNum = ticketData.sales.numFound;
            ticket.save((e) => { console.log('soldNum updated.'); });

            ticketData.sales.sale.forEach(list => {
                let soldseatObject = new soldseatsModel();
                soldseatObject.eventID = ticket.eventID;
                soldseatObject.ticketID = ticket._id;
                soldseatObject.quantity = list.quantity;
                soldseatObject.section = list.section;
                soldseatObject.rows = list.rows;
                soldseatObject.deliveryOption = list.deliveryOption;
                soldseatObject.deliveryTypeId = list.deliveryTypeId;
                soldseatObject.deliveryMethodId = list.deliveryMethodId;
                soldseatObject.displayPricePerTicket = list.displayPricePerTicket.amount;
                soldseatObject.stubhubMobileTicket = list.stubhubMobileTicket;
                soldseatObject.sectionId = list.sectionId;
                soldseatObject.transactionDate = list.transactionDate;
                soldseatObject.save((err) => {
                    // if (!err) { console.log('sold seat info saved'); }
                });
            })

        }
    });
}

function updateEventInfo(eventID) {
    let nowDateTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });
    new Promise((resolve) => {
        request.get(process.env.PRODUCT_SERVER_URL + '/getEventInternalDetailsById/' + eventID, (err, response) => {
            if (response.body == 'ok') {
                request.get(process.env.PRODUCT_SERVER_URL + '/saveTicketsById/' + eventID + '?datetime=' + nowDateTime, (err, response) => {
                    resolve();
                })
            }

        })

    })

}

function downloadF(data, res, filename) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '.csv"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    stringify(data, { header: true })
        .pipe(res);
}

module.exports = mainController;