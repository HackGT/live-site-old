<script>
// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {

    const DAYS_OF_WEEK = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    let eventData = [];

    function toggleDay(scheduleId, day) {
        document.querySelectorAll(scheduleId + ' .schedule-day-' + day).forEach(function (item, index) {
            item.classList.toggle('hidden');
        });

        var caret = document.querySelector(scheduleId + ' tr#header-day-' + day + ' > td > i');
        caret.classList.toggle('closed');
        caret.classList.toggle('open');
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
        // stuff the data into eventData
        var result = data.apiResponse;
        var scheduleId = "#schedule-" + data.num;
        var scheduleClass = ".schedule-" + data.num;

        if (result.items.length == 0) {
           document.querySelector(scheduleId)
                    .previousElementSibling.textContent = "No events found";
            return false;
        }
        result.items.sort(function(a,b) {
            return a.start.dateTime.diff(b.start.dateTime)
                || a.end.dateTime.diff(b.end.dateTime)
                || a.summary > b.summary;
        });


        eventData = result.items;
        filterEvents();

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
        } else {
            title = "Can't show schedule";
            body = "Something is preventing us from displaying the schedule.  Contact a member of the HackGTeam for help.";
        }

        document.querySelector(scheduleClass + ".schedule-error > h4").textContent = title;
        document.querySelector(scheduleClass + ".schedule-error > p.error-text").textContent = body;
        document.querySelector(scheduleClass + ".schedule-error > p.error-msg > small").textContent = "Error: " + msg;

        errorDiv.classList.remove("hidden");

        document.querySelector(scheduleClass + ".schedule-loading").classList.add("hidden");
   }


    function parseAsLocal(t) {
        let localString = t;
        if (t.slice(-1).toLowerCase() === "z") {
            localString = t.slice(0, -1);
        }
        return moment(localString);
    }
    function toUTC(t) {
        return parseAsLocal(t).utc();
    }

    function getCalendarDataFromCMS() {
        const queryString = `eventbases (start: 0) {
                                title
                                start_time
                                end_time
                                area {
                                    name
                                }
                                type
                            }`;

        fetch("https://cms.hack.gt/graphql", {
            method: "POST",
            headers: {
                "Content-Type": `application/json`,
                "Accept": `application/json`
            },
            body: JSON.stringify({
                query: `query {
                    ${queryString}
                }`
            })
        })
        .then(r => r.json())
        .then(json => {
            const items = json.data.eventbases.map(e => {
                const startTime = toUTC(e.start_time).local();
                const endTime = toUTC(e.end_time).local();
                return {
                    summary: e.title,
                    location: (e.area && e.area.name) || '',
                    start: {
                        dateTime: startTime,
                        pretty: startTime.format('hh:mm A'),
                        day: startTime.day()
                    },
                    end: {
                        dateTime: endTime,
                        pretty: endTime.format('hh:mm A'),
                        day: endTime.day()
                    },
                    type: e.type
                };
            })
            success({
                apiResponse: {
                    items,
                },
                num: 'cms'
            });
        })
        .catch(err => {
            console.error(err);
            scheduleError('cms', err.message);
        });
    }

    // doing this pseudo react-style

    let tabs = document.querySelectorAll("li.tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", (e) => {
            typeFilter(e, tabs[i].dataset.type);
        });
    }

// TODO fix days
// TODO fix alternating
    function typeFilter(e, type="all") { // onClick
        filterEvents(type);

        const activeTab = document.querySelector(".tab.active");
        activeTab.classList.remove("active");
        e.target.classList.add("active");
    }

    function filterEvents(type="all") {
        // clear the old table
        const scheduleId = '#schedule-cms';
        const schedule = document.querySelector(scheduleId + " > table > tbody");
        while (schedule.firstChild) {
            schedule.removeChild(schedule.firstChild);
        }

        const filtered = eventData.filter(e => {
            return type === "all" || type === e.type || type === 'other' && !e.type;
        });
        // generate the tr based on the row;

        if (filtered.length === 0) {
            return; // nothing to see here - this is effectively an error
        }

        var prevCurrentDay = filtered[0].start.day;
        schedule.insertAdjacentHTML('beforeend','<tr id="header-day-0" data-day="0"><td class="schedule-day" colspan="4"><i class="material-icons open">keyboard_arrow_down</i>'+ DAYS_OF_WEEK[prevCurrentDay] + '</td></tr>');
        document.querySelector(scheduleId + ' #header-day-0').onclick = function() {
            toggleDay(scheduleId, this.attributes['data-day'].value);
        };
        // TODO worry about ids
        var currentTime = moment();

        var eventValues;
        var day = 0;
        for (var i = 0; i < filtered.length; i++) {
            const event = filtered[i];
            if (i > 0) {
                const currentDay = event.start.day;

                if (currentDay !== prevCurrentDay) {
                    day++;
                    schedule.insertAdjacentHTML('beforeend','<tr id="header-day-' + day + '" data-day="' + day + '"><td class="schedule-day" colspan="4"><i class="material-icons open" draggable="false">keyboard_arrow_down</i>'
                        + DAYS_OF_WEEK[currentDay] + '</td></tr>');
                        document.querySelector(scheduleId + ' #header-day-' + day).addEventListener('click', function() {
                        toggleDay(scheduleId, this.attributes['data-day'].value);
                    });
                }
                prevCurrentDay = currentDay;
            }

            // It looks weird if the start time and end time for an event are
            // the same, so just show the start time for events that are
            // clearly meant to just mark an important time (such as a deadline)
            let timeString = event.start.pretty;
            if (event.start.pretty !== event.end.pretty) {
                timeString += ' - ' + event.end.pretty;
            }
            var location = event.location || "";
            var oldClass = (currentTime.diff(event.end.dateTime) > 0) ? ' old' : ""; //event already ended
            let trString = '<tr ';
            if (event.type) {
                trString += 'data-type=' + event.type + ' ';
            }
            schedule.insertAdjacentHTML('beforeend',trString + 'class="schedule-day-'+ day + oldClass + '"><td></td><td></td><td></td></tr>');

            eventValues = [
                event.summary,
                timeString,
                location
            ];
            document.querySelectorAll(scheduleId + ' > table > tbody > tr:last-child > td').forEach(function(item, index) {
                item.textContent = eventValues[index];
            });
        }


    }


    getCalendarDataFromCMS();
})();
</script>
