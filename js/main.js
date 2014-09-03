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

function saveLocation() {
    var loc = $('#stop').val();
    var brooklyn = $('.toggle').data('toggles');
    var finalLoc = loc + "|bk";
    if (brooklyn.active) {
        finalLoc = loc +"|mhtn";
    }
    localStorage.removeItem("savedstop");
    localStorage.setItem("savedstop", finalLoc);
    setLocName(loc);
}

function setLocName(loc) {
    var locName = $('#stop option[value="'+loc+'"]').html();
    $('#saved').html(locName.replace(/\&nbsp;/g,''));
    $('#clear').show();
}

function getLocation() {
    return localStorage.getItem("savedstop");
}

function clearLocation() {
    localStorage.removeItem("savedstop");
    $('#saved').html('');
    $('#clear').hide();
}

$(function() {
    if (window.navigator.standalone) {
        $("meta[name='apple-mobile-web-app-status-bar-style']").remove();
    }
    var savedLoc = getLocation();   
    var startMhtn = true;
    if (savedLoc) {
        var locData = savedLoc.split("|");
        setLocName(locData[0]);
        $('#stop').val(locData[0]);
        startMhtn = locData[1] == "mhtn";
    }
    $('.toggle').toggles({
        text:{on:'Manhattan',off:'Brooklyn'},
        on: startMhtn,
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
    $('#save').click(function(event) {
        event.preventDefault();
        saveLocation();
    });
    $('#clear').click(function(event) {
        event.preventDefault();
        clearLocation();
    });
    
    getTrainTime(updateClock);
    setTimeout(function() {
       timeoutTrain(); 
    }, 20000);
});
