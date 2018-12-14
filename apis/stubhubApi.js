var CookiesModel = require('../models/cookies');
var request = require('request');
var cheerio = require('cheerio');
var jar = request.jar();
var fb_access_token = 'EAABjXwWG6KMBAMRUoB6TBRZCzn3RNBhCCvRAEhQ1uz1ZCJDCaxgX6ivd8bahPoAaGCVFiuXBJc1ZAZCZA76y8odAWtbd09mDdSzFskcBJMthD3AZAmOCoq9V9t4oVlbN20H0QP8NwmpIT11BFLYGYZBYtRkZBstGif7mSl98JNvOrOOABXLuRcPXUc2mAALBSIZABx8FS7KOjeQZDZD';
var tmRefID = 'd3c757aaf5344d6f8cf1cc2a86188add';
var sessionID = '';


class stubhubApi {


    constructor() { }

    index() { }

    async checkLogin() {
        if (sessionID == '') {
            return false;
        } else {
            let profileHTML = await getProfilePage();
            //parse and check login
            const $ = cheerio.load(profileHTML);
            if ($('.profile-name')) {
                return true;
            } else return false;
        }
    }

    getSessionID() {
        return sessionID;
    }

    openSite() {
        let url = 'https://www.stubhub.com/';
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
            },
            jar: jar
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response, body) => {
                if (err) reject(err);
                resolve(body);
            });
        })
    }

    async login() {
        let response = await loginWithEmail();
        if (response && response != 403) {
            if(response.indexOf('permission') > 0) {
                return 'Permission Error.';
            }
            let data = JSON.parse(response);
            if (data.login && data.login.session_id) {
                sessionID = data.login.session_id;
                await initSession(data.login.session_id);
                return 'Loggedin';
            } else {
                return 'Unlogged';
            }
        } else {
            return 'Unlogged';
        }
    }

    async Testlogin() {
        let response = await loginWithEmail();
        return response;
    }

    async getEventsById(eventID, start, rows) {
        let url = 'https://pro.stubhub.com/shape/search/inventory/v2/seller/listings?eventId=' + eventID + '&priceType=listingPrice&sectionIdList=&pricingsummary=true&rows=' + rows + '&start=' + start + '&sort=value%20desc&sectionstats=true&_type=json&_=1544540306147';
        console.log(url);
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'target_host': 'stubhub',
                'referer': 'https://pro.stubhub.com/simweb/sim/services/priceanalysis?eventId=' + eventID,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
            },
            jar: jar
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response, body) => {
                if (err) reject(err);
                resolve(JSON.parse(body));
            });
        })
    }

    async getEventInternalDetails(eventID) {
        let url = 'https://pro.stubhub.com/shape/catalog/events/v3/' + eventID + '?mode=internal&_=1544540306147';
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'target_host': 'stubhub',
                'referer': 'https://pro.stubhub.com/simweb/sim/services/priceanalysis?eventId=' + eventID,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
            },
            jar: jar
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response, body) => {
                if (err) reject(err);
                resolve(JSON.parse(body));
            });
        })
    }
}

async function fbConnection() {
    let url = 'https://www.stubhub.com/shape/social/connect/v1/connections/facebook/' + fb_access_token + '?shstore=1';
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
        },
        jar: jar
    }
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    })
}

async function socialPost() {
    let url = 'https://iam.stubhub.com/login/social';
    var form_data = {
        provider_name: 'FB',
        provider_token: fb_access_token,
        tmRefID: tmRefID
    };
    const options = {
        url: url,
        method: 'POST',
        form: form_data,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'accept': 'application/json',
            'accept-language': 'en-us',
            'accept-encoding': 'gzip, deflate, br',
            accept: 'application/json',
            referer: 'https://www.stubhub.com/my/profile/'
        },
        jar: jar
    }
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    })
}

async function loginWithEmail() {
    var options = {
        method: 'POST',
        url: 'https://iam.stubhub.com/login',
        headers:
        {
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-us',
            'content-type': 'application/x-www-form-urlencoded',
            'Host': 'iam.stubhub.com',
            'accept': 'application/json',
            'referer': 'https://www.stubhub.com/my/profile/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
        },
        form: { username: 'tktundrgrnd@gmail.com', password: 'Tickets345' },
        jar: jar
    };
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    })
}

async function initSession(session_id) {
    var options = {
        method: 'POST',
        url: 'https://iam.stubhub.com/session/token/init',
        headers:
        {
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-us',
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
            referer: 'https://www.stubhub.com/my/profile/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
        },
        form: { si: session_id },
        jar: jar
    };
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    })
}

async function getProfilePage() {
    let url = 'https://www.stubhub.com/my/profile';
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
        },
        jar: jar
    }
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    })
}

module.exports = stubhubApi;