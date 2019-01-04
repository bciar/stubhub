function drawPriceChart(data) {
    // var data = [
    //     { y: '2014', a: 50, b: 90 },
    //     { y: '2015', a: 65, b: 75 },
    //     { y: '2016', a: 50, b: 50 },
    //     { y: '2017', a: 75, b: 60 },
    //     { y: '2018', a: 80, b: 65 },
    //     { y: '2019', a: 90, b: 70 },
    //     { y: '2020', a: 100, b: 75 },
    //     { y: '2021', a: 115, b: 75 },
    //     { y: '2022', a: 120, b: 85 },
    //     { y: '2023', a: 145, b: 85 },
    //     { y: '2024', a: 160, b: 95 }
    // ]
    var config = {
        data: data,
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['MinTicketPrice', 'AverageTicketPrice'],
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black'],
        lineColors: ['gray', 'red']
    };
    config.element = 'chart-prices';
    Morris.Line(config);
}

function drawTotalTickets(data) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: ['a'],
        labels: ['TotalTickets'],
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black'],
        lineColors: ['blue']
    };
    config.element = 'chart-totaltickets';
    Morris.Line(config);
}

function drawSoldVolume(data) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: ['a'],
        labels: ['Volume'],
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black'],
        lineColors: ['red']
    };
    config.element = 'chart-sold';
    Morris.Line(config);
}

function drawPredictChart(data) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Median Price', 'Predict'],
        fillOpacity: 0.6,
        hideHover: 'auto',
        behaveLikeLine: true,
        resize: true,
        pointFillColors: ['#ffffff'],
        pointStrokeColors: ['black'],
        lineColors: ['gray', 'red']
    };
    config.element = 'chart-prediction';
    Morris.Line(config);
}


$(function () {
    $('#btn-graph').click(() => {
        $('#prediction-section').addClass('hide');
        if ($('#graph-section').hasClass('hide')) {
            $('#graph-section').removeClass('hide');
        } else {
            $('#graph-section').addClass('hide');
        }
    })
    $('#btn-prediction').click(() => {
        $('#graph-section').addClass('hide');
        if ($('#prediction-section').hasClass('hide')) {
            $('#prediction-section').removeClass('hide');
        } else {
            $('#prediction-section').addClass('hide');
        }
    })
    $.ajax({
        url: '/getTicketInfo/' + $('#eventID').val(),
        method: 'GET',
        success: function (tickets) {
            let data_price = [], data_totaltickets = [], data_soldVolume = [];
            tickets.forEach(ticket => {
                var d = new Date(ticket.datetime);
                var datestring = d.getFullYear() + '-' + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
                let row_price = {
                    y: datestring,
                    a: ticket.minTicketPrice,
                    b: ticket.averageTicketPrice
                };
                let row_totalticket = {
                    y: datestring,
                    a: ticket.totalTickets
                }
                let row_soldVolume = {
                    y: datestring,
                    a: (ticket.soldVolume) ? ticket.soldVolume : 0
                }
                data_price.push(row_price);
                data_totaltickets.push(row_totalticket);
                data_soldVolume.push(row_soldVolume);
            });

            drawPriceChart(data_price);
            drawTotalTickets(data_totaltickets);
            drawSoldVolume(data_soldVolume);
        }
    })

    $.ajax({
        url: '/getTicketInfo-Prediction/' + $('#eventID').val(),
        method: 'GET',
        success: function (tickets) {
            let data_price = [];
            tickets.forEach(ticket => {
                var d = new Date(ticket.datetime);
                var datestring = d.getFullYear() + '-' + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
                let row_price = {};
                if (ticket.type == 0) {
                    row_price = {
                        y: datestring,
                        a: ticket.medianPrice,
                    };
                } else {
                    row_price = {
                        y: datestring,
                        b: ticket.medianPrice,
                    };
                }
                data_price.push(row_price);
            });
            drawPredictChart(data_price);
        }
    })
});

