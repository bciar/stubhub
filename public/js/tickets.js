
function viewActiveSeats(ticketID) {
    $('#seatDetails-div').attr('style', 'display: none;');
    $("#seatTable").dataTable().fnDestroy();
    $.ajax({
        url: '/viewActiveSeatDetails',
        method: 'POST',
        data: {
            ticketID
        },
        success: function (res) {
            if (res.status == 'success') {
                $('#seatDetails-div').attr('style', 'display: block;');
                let html = '';
                let i = 0;
                res.data.forEach(seat => {
                    i++;
                    let deliveryList = '';
                    if (seat.deliveryTypeList) {
                        let deliveryType = seat.deliveryTypeList[0];
                        let deliveryMethods = seat.deliveryMethodList;
                        if (deliveryType == 1) {
                            deliveryList = deliveryList + 'No PDF attached,';
                        } else if (deliveryType == 2) {
                            deliveryList = deliveryList + 'PDF attached, ';
                        } else if (deliveryType == 12 && deliveryMethods.indexOf(41) > -1) {
                            deliveryList = deliveryList + 'Mobileqr instant, ';
                        } else if (deliveryType == 9 && deliveryMethods.indexOf(42) > -1) {
                            deliveryList = deliveryList + 'Non Mobileqr instant, ';
                        } else if (deliveryType == 10 && deliveryMethods.indexOf(43) > -1) {
                            deliveryList = deliveryList + 'Modile transfer, ';
                        } else if (deliveryType == 5 && deliveryMethods.indexOf(24) > -1) {
                            deliveryList = deliveryList + 'Ups, ';
                        } else if (deliveryType == 4 && deliveryMethods.indexOf(17) > -1) {
                            deliveryList = deliveryList + 'LMS, ';
                        }
                    }

                    if (deliveryList.length > 0) {
                        deliveryList = deliveryList.substring(0, deliveryList.length - 2);
                    }
                    let row = '<tr><td>' + i + '</td><td>' + seat.section + '</td><td>' + seat.row + '</td><td>' + seat.price + '</td><td>' + seat.quantity + '</td><td>' + deliveryList + '</td></tr>';
                    html = html + row;
                });
                $('#seatTable-body').html(html);
                $('#seatTable').DataTable({ responsive: true });
            }
        }
    })
}

function viewSoldSeats(ticketID) {
    $('#soldseatDetails-div').attr('style', 'display: none;');
    $("#soldseatTable").dataTable().fnDestroy();
    $.ajax({
        url: '/viewSoldSeatDetails',
        method: 'POST',
        data: {
            ticketID
        },
        success: function (res) {
            if (res.status == 'success') {
                $('#soldseatDetails-div').attr('style', 'display: block;');
                let html = '';
                let i = 0;
                res.data.forEach(seat => {
                    i++;
                    var cdate = new Date(seat.transactionDate).toLocaleString('en-US', {
                        timeZone: 'America/New_York'
                    });
                    let row = '<tr><td>' + i + '</td><td>' + seat.section + '</td><td>' + seat.displayPricePerTicket + '</td><td>' + seat.rows + '</td><td>' + seat.quantity + '</td><td>' + seat.deliveryOption + '</td><td>' + cdate + '</td></tr>';
                    html = html + row;
                });
                $('#soldseatTable-body').html(html);
                $('#soldseatTable').DataTable({ responsive: true });
            }
        }
    })
}
s