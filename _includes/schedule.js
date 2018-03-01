<script>
// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {
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
        var scheduleId = "#schedule-" + this.num;

        if (result.items.length == 0) {
            $(scheduleId).prev().text("No events found");
        } else {
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
            console.log(result)
            var schedule = $(scheduleId + " > table > tbody");
            console.log(scheduleId + " > table > tbody");
            var startTime;
            var endTime;
            var endTimeAsDate;
            var location;
            var currentTime = new Date();
            var oldClass;

            var prevCurrentDay = new Date(events[0].start.dateTime).getDay();
            schedule.append('<tr><td class="schedule-day" colspan="4">'
                + DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');

            var currentDay;
            console.log(schedule);
            console.log(events.length);
            var eventValues;
            for (var i = 0; i < events.length; i++) {
                if (i > 0) {
                    currentDay = new Date(events[i].start.dateTime).getDay();

                    if (currentDay != prevCurrentDay) {
                        schedule.append('<tr><td class="schedule-day" colspan="4">'
                            + DAYS_OF_WEEK[currentDay] + '</td></tr>');
                    }
                    prevCurrentDay = currentDay;
                }

                startTime = prettyTime(new Date(events[i].start.dateTime));
                endTimeAsDate = new Date(events[i].end.dateTime)
                endTime = prettyTime(endTimeAsDate);
                location = events[i].location || "";
                oldClass = (currentTime - endTimeAsDate > 0) ? ' class="old"' : ""; //event already ended
                console.log("current - end",currentTime - endTimeAsDate > 0 );
                schedule.append("<tr" + oldClass + "><td></td><td></td><td></td><td></td></tr>");
                // schedule.append("<tr" + oldClass + "><td>" + events[i].summary + "</td><td>" + startTime + "</td><td>" + endTime + "</td><td> " + location + "</td></tr>");
                eventValues = [
                    events[i].summary,
                    startTime,
                    endTime,
                    location
                ];

                $(scheduleId + ' > table > tbody > tr:last-child > td').each(function(index) {
                    $(this).text(eventValues[index]);
                });
            }

            $(scheduleId).prev().addClass("hidden");
            $(scheduleId).removeClass("hidden");
        } //END else
    }


    var url;
    var calId;

    for (var i = 0; i < calendars.length; i++) {
        calId = calendars[i];
        url = "https://www.googleapis.com/calendar/v3/calendars/" + calId
            + "/events?key={{page.gcal.api_key}}&timeMin=" + startDateTime + "&timeMax=" + endDateTime;

        $.ajax({
            "url": url,
            type: "GET",
            "num": i,
            "success": success
        });
    }

    //TODO: error handling
    //TODO: max time later than min time (perhaps console.warn? "This page is configured wrong" on the schedule page: ..." or figure out how to make the jekyll build fail)
})();
</script>
