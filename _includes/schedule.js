<script>
// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {
    function toggleDay(day) {
        document.querySelectorAll('.schedule-day-' + day).forEach(function (item, index) {
            console.log(item, index);
            item.classList.toggle('hidden');
        });

        console.log('tr#header-day-' + day + ' > td > i');
        var caret = document.querySelector('tr#header-day-' + day + ' > td > i');
        var currentCaret = caret.textContent;
        caret.textContent = currentCaret === "keyboard_arrow_down" ? "keyboard_arrow_right" : "keyboard_arrow_down";
    }

    function prettyTime(dateObj) {
        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var ampm = (hours >= 12) ? "PM" : "AM";
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

    function containsMultipleDays(events) {
        var prevCurrentDay = new Date(events[0].start.dateTime).getDay();
        for (var i = 1; i < events.length; i++) {
            var currentDay = new Date(events[i].start.dateTime).getDay();
            if (currentDay != prevCurrentDay) {
                return true;
            }
        }
        return false;
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

        var showDayHeaders = containsMultipleDays(events);

        if (showDayHeaders) {

            var prevCurrentDay = new Date(events[0].start.dateTime).getDay();
            schedule.insertAdjacentHTML('beforeend','<tr id="header-day-0" data-day="0"><td class="schedule-day" colspan="4"><i class="material-icons">keyboard_arrow_down</i>'+ DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');
            document.querySelector('#header-day-0').onclick = function() {
                toggleDay(this.attributes['data-day'].value);
            };
        }

        var day = 0;
        var eventValues;
        for (var i = 0; i < events.length; i++) {
            if (i > 0) {
                if (showDayHeaders) {

                    var currentDay = new Date(events[i].start.dateTime).getDay();

                    if (currentDay != prevCurrentDay) {
                        day++;
                        schedule.insertAdjacentHTML('beforeend','<tr id="header-day-' + day + '" data-day="' + day + '"><td class="schedule-day" colspan="4"><i class="material-icons">keyboard_arrow_down</i>'
                            + DAYS_OF_WEEK[currentDay] + '</td></tr>');
                        document.querySelector('#header-day-' + day).addEventListener('click', function() {
                            toggleDay(this.attributes['data-day'].value);
                        });
                    }
                    prevCurrentDay = currentDay;
                }
            }

            var startTime = prettyTime(new Date(events[i].start.dateTime));
            var endTimeAsDate = new Date(events[i].end.dateTime)
            var endTime = prettyTime(endTimeAsDate);

            // It looks weird if the start time and end time for an event are
            // the same, so just show the start time for events that are
            // clearly meant to just mark an important time (such as a deadline)
            if (endTime == startTime) {
                endTime = "";
            }
            var location = events[i].location || "";
            var oldClass = (currentTime - endTimeAsDate > 0) ? ' old' : ""; //event already ended
            schedule.insertAdjacentHTML('beforeend','<tr class="schedule-day-'+ day + oldClass + '"><td></td><td></td><td></td><td></td></tr>');

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

        prevScheduleBlockBody.classList.add("hidden");
        scheduleBlockBody.classList.remove("hidden");
    }

    function scheduleError(i) {
        var scheduleId = "#schedule-" + i;
        var errorElem = document.querySelector(scheduleId);
        errorElem.previousElementSibling.textContent = "The schedule couldn't be retrieved.  Please check your internet connection."
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
        .catch(function (e) {
            console.error(e);
            scheduleError(i);
        });
    }

    for (var i = 0; i < calendars.length; i++) {
        var calId = calendars[i];
        var url = "https://www.googleapis.com/calendar/v3/calendars/" + calId
            + "/events?key={{page.gcal.api_key}}&timeMin=" + startDateTime
            + "&timeMax=" + endDateTime;

        console.log(url);

        getCalendarData(url, i);
    }
})();
</script>
