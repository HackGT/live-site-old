<script>
function prettyTime(dateObj) {
    var hours = dateObj.getHours();
    var minutes = dateObj.getMinutes();
    var ampm = (hours > 12) ? "PM" : "AM";
    if (hours == 0) {
        hours = 12;
    } else if (hours > 12) {
        hours -= 12;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return hours + ":" + minutes + " " + ampm;
}

function success(result) {
    result.items.sort(function(a,b) {
        return new Date(a.start.dateTime) - new Date(b.start.dateTime)
            || new Date(a.end.dateTime) - new Date(b.end.dateTime);
        //return 1;
    });

    var events = result.items;
    var schedule = $("#schedule-1 > ul");
    var startTime;
    var endTime;
    for (var i = 0; i < events.length; i++) {
        startTime = prettyTime(new Date(events[i].start.dateTime))
        endTime = prettyTime(new Date(events[i].end.dateTime))
        schedule.append("<li>" + events[i].summary + " (" + startTime + "-" + endTime + ") at " + events[i].location +"</li>");

    }

    schedule.parent().removeClass("hidden");
}

(function() {
    //console.log("hi");
    //x();

    var gcalRequest = new XMLHttpRequest();

    var url = "https://www.googleapis.com/calendar/v3/calendars/{{ page.gcal.id }}/events?key={{page.gcal.api_key}}&timeMin={{page.gcal.start_datetime}}&timeMax={{page.gcal.end_datetime}}";

    //TODO: error handling
    //TODO: no events exist
    //TODO: max time later than min time (perhaps show "This page is configured wrong" on the schedule page" or figure out how to make the jekyll build fail)
    $.get(url, success);

})();
</script>
