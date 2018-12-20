var frequencyIndex = 1;

$(function () {
    $('#eventTable').DataTable({ responsive: true });
    $('#downloadCSV').click(function () {
        let data = { names: $('#filter').val() };
        showloading();
        window.location.href = '/downloadcsv?filter=' + JSON.stringify(data);
        $('#filterModal').modal('toggle');
        setTimeout(() => {
            endloading();
        }, 3000);
    });

    $('#SaveSingleEvent').click(() => {

        let id = $('#singleEventInput').val();
        if (id == '' || id.length != 9) {
            $('#singleEventInput').focus();
        } else {
            showloading();
            //save event
            $.ajax({
                url: '/event/addSingle',
                method: 'POST',
                data: {
                    eventID: id
                },
                success: function (res) {
                    setTimeout(() => {
                        endloading();
                        location.href = '/';
                    }, 2000);
                }
            });
        }
    });
})

function removeEvent(eventID) {
    if (confirm("Are you sure to remove this event?")) {
        location.href = '/events/remove/' + eventID;
    }
}

function openSetting(eventID) {
    //get data
    $.ajax({
        url: '/getEventData/' + eventID,
        method: 'GET',
        success: function (event) {
            var ftype = event.pullFrequency.ftype;
            divRows = '<div class="col-md-12"><div class="col-md-3 float-left"><label for="">Start Date</label><input type="text" class="form-control datepicker" name="start_date" required></div><div class="col-md-3  float-left"><label for="">End Date</label><input type="text" class="form-control datepicker" name="end_date" required></div><div class="col-md-4  float-left"><label for="">Freqency</label><select name="frequency" id="" class="form-control" required><option value=""></option><option value="10">Every 10 mins</option><option value="20">Every 20 mins</option><option value="30">Every 30 mins</option><option value="60">Every 1 hour</option><option value="120">Every 2 hours</option><option value="360">Every 6 hours</option><option value="720">Every 12 hours</option></select></div><div class="col-md-1 float-left"><i class="fas fa-minus-circle remove-condition" title="Remove condition" onclick="removeCondition(this)"></i></div></div>';
            if (ftype == 2 && event.pullFrequency && event.pullFrequency.frequencies != []) {
                divRows = '';
                let freqencies = event.pullFrequency.frequencies;
                freqencies.forEach(row => {
                    let divRow = '<div class="col-md-12"><div class="col-md-3 float-left"><label for="">Start Date</label><input type="text" class="form-control datepicker" name="start_date" value="' + row.start + '" required></div><div class="col-md-3  float-left"><label for="">End Date</label><input type="text" class="form-control datepicker" name="end_date" value="' + row.end + '" required></div><div class="col-md-4  float-left"><label for="">Freqency</label><select name="frequency" id="" class="form-control" required><option value=""></option>';
                    let options = ['10', '20', '30', '60', '120', '360', '720'];
                    let optionStrings = ['Every 10 mins', 'Every 20 mins', 'Every 30 mins', 'Every 1 hr', 'Every 2 hrs', 'Every 3 hrs', 'Every 12 hrs'];
                    var optionItems = '';
                    for (let j = 0; j < options.length; j++) {
                        let opt = options[j];
                        let optString = optionStrings[j];
                        var opt_string = '';
                        if (opt == row.frequency) {
                            opt_string = '<option value="' + opt + '" selected>' + optString + '</options>';
                        } else {
                            opt_string = '<option value="' + opt + '">' + optString + '</options>';
                        }
                        optionItems = optionItems + opt_string;
                    };
                    divRow = divRow + optionItems + '</select></div><div class="col-md-1 float-left"><i class="fas fa-minus-circle remove-condition" title="Remove condition" onclick="removeCondition(this)"></i></div></div>';
                    divRows = divRows + divRow;
                });
            }
            $('#condition-body').html(divRows);
            $('#frequencyFrom').attr('action', '/event/' + eventID + '/addFrequency');
            $('#settingModal').modal();
            $('.datepicker').datepicker({
                format: 'mm/dd/yyyy',
                container: '#settingModal'
            });
        }
    })

}

function addNewCondition() {
    let divRow = '<div class="col-md-12"><div class="col-md-3 float-left"><label for="">Start Date</label><input type="text" class="form-control datepicker" name="start_date" required></div><div class="col-md-3  float-left"><label for="">End Date</label><input type="text" class="form-control datepicker" name="end_date" required></div><div class="col-md-4  float-left"><label for="">Freqency</label><select name="frequency" id="" class="form-control" required><option value=""></option><option value="10">Every 10 mins</option><option value="20">Every 20 mins</option><option value="30">Every 30 mins</option><option value="60">Every 1 hour</option><option value="120">Every 2 hours</option><option value="360">Every 6 hours</option><option value="720">Every 12 hours</option></select></div><div class="col-md-1 float-left"><i class="fas fa-minus-circle remove-condition" title="Remove condition" onclick="removeCondition(this)"></i></div></div>';
    $('#condition-body').append(divRow);
    $('.datepicker').datepicker({
        format: 'mm/dd/yyyy',
        startDate: '1d',
        container: '#settingModal'
    });
}

function removeCondition(object) {
    let condition_row = $(object).parent().parent();
    condition_row.remove();
}

var checkedAll = false;
$(function () {
    $("#checkAll").click(() => {
        checkedAll = !checkedAll;
        $('.checkbox').prop('checked', checkedAll);
    })
})

function removeSelectedEvents() {
    let checkboxItems = $(".checkbox");
    let eventIDs = [];
    for (let i = 0; i < checkboxItems.length; i++) {
        let row = $(checkboxItems[i]);
        if (row.prop('checked') == true) {
            eventIDs.push(row.attr('data-eventID'));
        }
    };
    if (eventIDs.length > 0) {
        if (confirm("Are you sure to remove these events?" + eventIDs)) {
            $.ajax({
                url: '/events/remove',
                method: 'POST',
                data: { eventIDs: JSON.stringify(eventIDs) },
                success: function (res) {
                    location.reload();
                }
            })
        }
    }

}

function editSelectedFrequency() {
    let checkboxItems = $(".checkbox");
    let eventIDs = [];
    for (let i = 0; i < checkboxItems.length; i++) {
        let row = $(checkboxItems[i]);
        if (row.prop('checked') == true) {
            eventIDs.push(row.attr('data-eventID'));
        }
    };
    if (eventIDs.length > 0) {
        let divRows = '<div class="col-md-12"><div class="col-md-3 float-left"><label for="">Start Date</label><input type="text" class="form-control datepicker" name="start_date" required></div><div class="col-md-3  float-left"><label for="">End Date</label><input type="text" class="form-control datepicker" name="end_date" required></div><div class="col-md-4  float-left"><label for="">Freqency</label><select name="frequency" id="" class="form-control" required><option value=""></option><option value="10">Every 10 mins</option><option value="20">Every 20 mins</option><option value="30">Every 30 mins</option><option value="60">Every 1 hour</option><option value="120">Every 2 hours</option><option value="360">Every 6 hours</option><option value="720">Every 12 hours</option></select></div><div class="col-md-1 float-left"><i class="fas fa-minus-circle remove-condition" title="Remove condition" onclick="removeCondition(this)"></i></div></div>';
        $('#condition-body').html(divRows);
        $('#multipleFrequencies').val(JSON.stringify(eventIDs));
        $('#frequencyFrom').attr('action', '/event/addFrequencies');
        $('#fr-modalmultiselect').html('You selected these events: <br>' + eventIDs);
        $('#settingModal').modal();
        $('.datepicker').datepicker({
            format: 'mm/dd/yyyy',
            container: '#settingModal'
        });
    }
}

function openNewTab() {
    let checkboxItems = $(".checkbox");
    let eventIDs = [];
    for (let i = 0; i < checkboxItems.length; i++) {
        let row = $(checkboxItems[i]);
        if (row.prop('checked') == true) {
            eventIDs.push(row.attr('data-eventID'));
        }
    };
    eventIDs.forEach(eventID => {
        window.open(
            '/tickets/'+eventID,
            '_blank' 
          );
    });
}
