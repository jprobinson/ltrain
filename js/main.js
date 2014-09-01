function getTrainTime(callback) {
    console.log('getting train time');
    $.get('/svc/subway-api/v1/next-trains/L11',
        function(data) {
            console.log(data);
            var train = new Date(data.northbound);
            callback(train);
        });
}

function updateClock(time) {
    $('#clock').countdown(time, function(event) {
        var format = '%M:%S';
        $(this).html(event.strftime(format));
    }).on('finish', function() {
        setTimeout(function() {
            getTrainTime(updateClock);
        }, 500);
    });
}

$(function() {
    getTrainTime(updateClock);

    setTimeout(function() {
        getTrainTime(updateClock);
        setTimeout(function() {
            getTrainTime(updateClock);
        }, 60000);
    }, 60000);

});
