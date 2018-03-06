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

    function success(data) {
        var result = data.apiResponse;
        var scheduleId = "#schedule-" + data.num;

        if (result.items.length == 0) {
            document.querySelector(scheduleId)
                .previousElementSibling.textContent = "No events found";
            return false;
        }
        result.items.sort(function(a,b) {
            return new Date(a.start.dateTime) - new Date(b.start.dateTime)
                || new Date(a.end.dateTime) - new Date(b.end.dateTime)
                || a.summary > b.summary;
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
        var schedule = document.querySelector(scheduleId + " > table > tbody");
        var currentTime = new Date();

        var prevCurrentDay = new Date(events[0].start.dateTime).getDay();
        schedule.insertAdjacentHTML('beforeend','<tr><td class="schedule-day" colspan="4">'+ DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');

        var eventValues;
        for (var i = 0; i < events.length; i++) {
            if (i > 0) {
                var currentDay = new Date(events[i].start.dateTime).getDay();

                if (currentDay != prevCurrentDay) {
                    schedule.insertAdjacentHTML('beforeend','<tr><td class="schedule-day" colspan="4">'
                        + DAYS_OF_WEEK[currentDay] + '</td></tr>');
                }
                prevCurrentDay = currentDay;
            }

            var startTime = prettyTime(new Date(events[i].start.dateTime));
            var endTimeAsDate = new Date(events[i].end.dateTime)
            var endTime = prettyTime(endTimeAsDate);
            var location = events[i].location || "";
            var oldClass = (currentTime - endTimeAsDate > 0) ? ' class="old"' : ""; //event already ended
            schedule.insertAdjacentHTML('beforeend',"<tr" + oldClass + "><td></td><td></td><td></td><td></td></tr>");

            eventValues = [
                events[i].summary,
                startTime,
                endTime,
                location
            ];
            document.querySelectorAll(scheduleId + ' > table > tbody > tr:last-child > td').forEach(function(item, index) {
                item.textContent = eventValues[index];
            });
        }

        var scheduleBlockBody = document.querySelector(scheduleId);
        var prevScheduleBlockBody = scheduleBlockBody.previousElementSibling;

        if (prevScheduleBlockBody.classList) {
            prevScheduleBlockBody.classList.add("hidden");
        } else {
            prevScheduleBlockBody.className += " hidden";
        }

        if (scheduleBlockBody.classList) {
            scheduleBlockBody.classList.remove("hidden");
        } else {
            scheduleBlockBody.className = scheduleBlockBody.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    function scheduleError(i) {
        var scheduleId = "#schedule-" + i;
        var errorElem = document.querySelector(scheduleId);
        errorElem.previousElementSibling.textContent = "The schedule couldn't be retrieved.  Please check your internet connection.";
    }

    // Show a warning in the console if endDateTime comes before startDateTime
    if (new Date(endDateTime) - new Date(startDateTime) < 0) {
        console.warn("schedule.js: No calendar events will be fetched!  The date of the last calendar event to include in the schedule (endDateTime) is earlier than the date of the first calendar event to include in the schedule.  The current start date is "
        + new Date(startDateTime)
        + ".  The current end date is " + new Date(endDateTime) + ".");
    }

    function getCalendarData(url, i) {
        fetch(url).then(function (result) {
            return result.json();
        }).then(function(data) {
            success({ apiResponse: data,
                    num: i });
        })
        .catch(function () {
            scheduleError(i);
        });
    }

    for (var i = 0; i < calendars.length; i++) {
        var calId = calendars[i];
        var url = "https://www.googleapis.com/calendar/v3/calendars/" + calId
            + "/events?key={{page.gcal.api_key}}&timeMin=" + startDateTime
            + "&timeMax=" + endDateTime;

        getCalendarData(url, i);
    }
})();
</script>
