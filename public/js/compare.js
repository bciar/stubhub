$(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventIDs = urlParams.get('eventIDs');
    $.ajax({
        url: 'comparePageJSON?eventIDs=' + eventIDs,
        method: 'GET',
        success: function (res) {
            let data = res.data;
            let graphData_tt = [];
            let graphData_mp = [];
            let graphData_st = [];
            let graphData_sv = [];
            // res.data.forEach(rowData => {
            for (let i = 0; i < data.length; i++) {
                let rowData = data[i];
                let rdate = rowData.datetime.replace(', 7:00:00 PM', '').trim();
                let rdate_split = rdate.split('/');
                let date = rdate_split[2] + '-' + rdate_split[0] + '-' + rdate_split[1];

                let row_data_tt = { y: date };
                let row_data_mp = { y: date };
                let row_data_st = { y: date };
                let row_data_sv = { y: date };

                // rowData.events.forEach(event => {

                for (let j = 0; j < rowData.events.length; j++) {
                    let event = rowData.events[j];
                    row_data_tt[event.eventID] = (event.ticket && event.ticket.totalTickets != undefined) ? event.ticket.totalTickets : 0;
                    row_data_mp[event.eventID] = (event.ticket && event.ticket.minTicketPrice != null) ? event.ticket.minTicketPrice : 0;
                    row_data_st[event.eventID] = (event.ticket != null) ? (i > 0 && data[i - 1].events[j].ticket != null) ? event.ticket.soldNum - data[i - 1].events[j].ticket.soldNum : event.ticket.soldNum : 0;
                    row_data_sv[event.eventID] = (event.ticket != null) ? (i > 0 && data[i - 1].events[j].ticket != null) ? data[i].events[j].ticket.soldVolume - data[i - 1].events[j].ticket.soldVolume : data[i].events[j].ticket.soldVolume : 0;
                };
                graphData_tt.push(row_data_tt);
                graphData_mp.push(row_data_mp);
                graphData_st.push(row_data_st);
                graphData_sv.push(row_data_sv);
            };
            drawTTChart(graphData_tt, res.eventIDs);
            drawMPChart(graphData_mp, res.eventIDs);
            drawSTChart(graphData_st, res.eventIDs);
            drawSVChart(graphData_sv, res.eventIDs);
        }
    })
})

function drawTTChart(data, eventIDs) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: eventIDs,
        labels: eventIDs,
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black']
    };
    config.element = 'chart-tt';
    Morris.Line(config);
}

function drawMPChart(data, eventIDs) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: eventIDs,
        labels: eventIDs,
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black']
    };
    config.element = 'chart-mp';
    Morris.Line(config);
}

function drawSTChart(data, eventIDs) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: eventIDs,
        labels: eventIDs,
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black']
    };
    config.element = 'chart-st';
    Morris.Line(config);
}

function drawSVChart(data, eventIDs) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: eventIDs,
        labels: eventIDs,
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black']
    };
    config.element = 'chart-sv';
    Morris.Line(config);
}