<script>
// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {
    function toggleDay(day) {
        document.querySelectorAll('.schedule-day-' + day).forEach(function (item, index) {
            item.classList.toggle('hidden');
        });

        var caret = document.querySelector('tr#header-day-' + day + ' > td > i');
        caret.classList.toggle('closed');
        caret.classList.toggle('open');
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
        var scheduleClass = ".schedule-" + data.num;
        console.log(result.items.length);
        if (result.items.length == 0) {
            // Show a warning in the console if endDateTime comes before startDateTime
            if (new Date(endDateTime) - new Date(startDateTime) < 0) {
                scheduleError(data.num, "Event range end date is before start date")
            } else {
                scheduleError(data.num, "No events found")
            }
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
            schedule.insertAdjacentHTML('beforeend','<tr id="header-day-0" data-day="0"><td class="schedule-day" colspan="4"><i class="material-icons open">keyboard_arrow_down</i>'+ DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');
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
                        schedule.insertAdjacentHTML('beforeend','<tr id="header-day-' + day + '" data-day="' + day + '"><td class="schedule-day" colspan="4"><i class="material-icons open" draggable="false">keyboard_arrow_down</i>'
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
        document.querySelector(scheduleClass + ".schedule-loading").classList.add("hidden");
        scheduleBlockBody.classList.remove("hidden");
    }

    function scheduleError(i, msg) {
        var scheduleClass = ".schedule-" + i;
        var errorDiv = document.querySelector(scheduleClass + ".schedule-error")
        var title, body;
        if (msg === "Failed to fetch") {
            title = "No internet connection";
            body = "We can't load the schedule right now because your device isn't connected to the internet.  Please check " +
                "your internet connection and try again."
        } else if (msg === "No events found") {
            title = "No events found";
            body = ""
        } else {
            title = "Can't show schedule";
            body = "Something is preventing us from displaying the schedule.  Contact a member of the HackGTeam for help.";
        }

        document.querySelector(scheduleClass + ".schedule-error > h4").textContent = title;
        document.querySelector(scheduleClass + ".schedule-error > p.error-text").textContent = body;
        if (msg !== "No events found") {
            document.querySelector(scheduleClass + ".schedule-error > p.error-msg > small").textContent = "Error: " + msg;
        }

        errorDiv.classList.remove("hidden");

        document.querySelector(scheduleClass + ".schedule-loading").classList.add("hidden");



        //var errorElem = document.querySelector(scheduleClass);
        //errorElem.previousElementSibling.lastChild.textContent = "The schedule couldn't be retrieved.  Please check your internet connection.  Error: " + msg;
    }

    function getCalendarData(url, i) {
        fetch(url).then(function (result) {
            return result.json();
        }).then(function(data) {
            success({ apiResponse: data,
                    num: i });
        })
        .catch(function (e) {
            scheduleError(i, e.message);
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
