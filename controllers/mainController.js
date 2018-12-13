var stubhubApi = require('../apis/stubhubApi');
var stubhub = new stubhubApi();
var eventsModel = require('../models/events');
var ticketModel = require('../models/tickets');

var vvv = 0;
class mainController {
    constructor() { }

    async getEventDetail(req, res) {
        await stubhub.openSite();
        console.log('Site Opened')
        await stubhub.login();
        res.send("ok");
    }
    
}


module.exports = mainController;