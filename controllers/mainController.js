var stubhubApi = require('../apis/stubhubApi');
var stubhub = new stubhubApi();
var eventsModel = require('../models/events');
var ticketModel = require('../models/tickets');
var vvv = 0;

class mainController {
    constructor() { }

    async getEventDetail(req, res) {
        let login_response = siteLogin();
        if(login_response == 'Loggedin') {
            let eventData = await stubhub.getEventsById('103926521');
            res.json(eventData);
        } else {
            res.send("Login Failed");
        }
    }
    
    async loginTest(req, res) {
        await stubhub.openSite();
        let loginStatus = await stubhub.Testlogin();
        res.send(loginStatus);
    }
}

async function siteLogin() {
    let loginStatus = await stubhub.checkLogin();
    if(loginStatus == false) {
        await stubhub.openSite();
        let response = await stubhub.login();
        return response;
    }
}


module.exports = mainController;