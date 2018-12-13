var stubhubApi = require('../apis/stubhubApi');
var stubhub = new stubhubApi();
var eventsModel = require('../models/events');
var ticketModel = require('../models/tickets');

var vvv = 0;
class mainController {
    constructor() { }

    async getEventDetail(req, res) {
        await stubhub.openSite();
        let login_response = await stubhub.login();
        if(login_response == 'Loggedin') {
            let eventData = await stubhub.getEventsById('103926521');
            res.json(eventData);
        } else {
            res.send("Login Failed");
        }
    }
    
}


module.exports = mainController;