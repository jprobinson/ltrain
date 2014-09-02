var first = true;

function getTrainTime(callback) {
    var stop = $('#stop').val();
    $.get('/svc/subway-api/v1/next-trains/'+stop,
        function(data) {
            var next;
            var following;
            var brooklyn = $('.toggle').data('toggles');
            if (brooklyn.active) {
                if (data.northbound != null) {
                    next = new Date(data.northbound[0]);
                    following = new Date(data.northbound[1]);
                }
            } else {
                if (data.southbound != null) {
                    next = new Date(data.southbound[0]);
                    following = new Date(data.southbound[1]);
                }
            }

            callback(next, following);
        });
}

function timeoutTrain() {
    getTrainTime(updateClock);
    setTimeout(function() {
            timeoutTrain();
    }, 20000);
}

function updateClock(next, following) {
    if (next == undefined) {
        $('#nextClock').countdown('stop');
        $('#nextClock').html('N/A');
        $('#followClock').countdown('stop');
        $('#followClock').html('N/A');
        return;
    }
    if (!first) {
        $('#nextClock').countdown(next);
        $('#followClock').countdown(following);
    } else {
        first = false;
        $('.clocks').each(function(){
            var $this = $(this), id = $(this).attr('id');  
            var time = following;
            if (id == 'nextClock') {
                time = next;
            }
            $this.countdown(time, function(event) {
                var format = '%M:%S';
                $(this).html(event.strftime(format));
            });
        });
    }
}

$(function() {
    $('.toggle').toggles({
        text:{on:'Manhattan',off:'Brooklyn'},
        on: true,
        width:250,
        height:50
    });
    $('.toggle').on('toggle', function(){
        getTrainTime(updateClock);
    });
    var stop = $('#stop');
    stop.change(function(event){
        getTrainTime(updateClock);
    });
    
    getTrainTime(updateClock);
    setTimeout(function() {
       timeoutTrain(); 
    }, 20000);
});
