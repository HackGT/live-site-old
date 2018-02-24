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
            || new Date(a.end.dateTime) - new Date(b.end.dateTime)
            || a.summary > b.summary;
        //return 1;
    });


    var DAYS_OF_WEEK = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    var events = result.items;
    var schedule = $("#schedule-1 > table > tbody");
    var startTime;
    var endTime;
    var location;

    var prevCurrentDay = new Date(events[0].start.dateTime).getDay();
    schedule.append('<tr><td class="schedule-day" colspan="4">'
        + DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');

    var currentDay;

    for (var i = 0; i < events.length; i++) {
        if (i > 0) {
            currentDay = new Date(events[i].start.dateTime).getDay();

            if (currentDay != prevCurrentDay) {
                schedule.append('<tr><td class="schedule-day" colspan="4">'
                    + DAYS_OF_WEEK[currentDay] + '</td></tr>');
            }
            prevCurrentDay = currentDay;
        }

        startTime = prettyTime(new Date(events[i].start.dateTime)) || "";
        endTime = prettyTime(new Date(events[i].end.dateTime)) || "";
        location = events[i].location || "";
        schedule.append("<tr><td>" + events[i].summary + "</td><td>" + startTime + "</td><td>" + endTime + "</td><td> " + location + "</td></tr>");

    }

    $('#schedule-1').prev().addClass("hidden");
    $('#schedule-1').removeClass("hidden");
}

(function() {
    var url = "https://www.googleapis.com/calendar/v3/calendars/{{ page.gcal.id }}/events?key={{page.gcal.api_key}}&timeMin={{page.gcal.start_datetime}}&timeMax={{page.gcal.end_datetime}}";

    //TODO: error handling
    //TODO: no events exist
    //TODO: max time later than min time (perhaps console.warn? "This page is configured wrong" on the schedule page: ..." or figure out how to make the jekyll build fail)
    $.get(url, success);

})();
</script>
