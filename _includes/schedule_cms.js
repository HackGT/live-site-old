<script>
// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {

    const CMS_QUERY = `
        eventbases(start: 0) {
            id
            title
            description
            start_time
            end_time
            area {
                name
            }
            type
        }
        talks(start: 0) {
            base {
                id
            }
            slide_link
            code_link
            prereqs
            survey_link
            people {
                name
            }
            partner {
                name
            }
        }
    `;


    const DAYS_OF_WEEK = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


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

    let eventData = [];

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
        filterEvents(); // builds table

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

        fetch("https://cms.horizons.hack.gt/graphql", {
            method: "POST",
            headers: {
                "Content-Type": `application/json`,
                "Accept": `application/json`
            },
            body: JSON.stringify({
                query: `query {
                    ${CMS_QUERY}
                }`
            })
        })
        .then(r => r.json())
        .then(json => {
            const items = json.data.eventbases.map(e => {
                const startTime = toUTC(e.start_time).local();
                const endTime = toUTC(e.end_time).local();
                return {
                    id: e.id,
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
                    type: e.type,
                    description: e.description
                };
            });
            json.data.talks.forEach(talk => {
                const { base, people, partner, ...other } = talk;
                let presenters = [];
                if (people) {
                    presenters = people.map(p => p.name);
                }
                const eventIndex = items.findIndex(item => item.id === base.id);
                if (eventIndex === -1) return;
                items[eventIndex] = {...items[eventIndex], ...other, partner: partner ? partner.name : null, people: presenters};
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

        var currentTime = moment();
        var prevCurrentDay = filtered[0].start.day;
        schedule.insertAdjacentHTML(
            'beforeend',
            '<tr id="header-day-0" data-day="0"><td class="schedule-day" colspan="4"><i class="material-icons open">keyboard_arrow_down</i>'+
            DAYS_OF_WEEK[prevCurrentDay] +
            '</td></tr>' +
            `<tr class="schedule-interactive schedule-day-0">
                <th>Event</th>
                <th>Time</th>
                <th>Location</th>
            </tr>`
        );
        document.querySelector(scheduleId + ' #header-day-0').onclick = function() {
            toggleDay(scheduleId, this.attributes['data-day'].value);
        };


        var eventValues;
        var day = 0;
        for (var i = 0; i < filtered.length; i++) {
            const event = filtered[i];
            if (i > 0) {
                const currentDay = event.start.day;

                if (currentDay !== prevCurrentDay) {
                    day++;
                    if (currentTime.isAfter(filtered[i-1].end.dateTime)) {
                        toggleDay(scheduleId,
                            document.querySelector('#header-day-' + (day - 1)).dataset['day']);
                    }

                    schedule.insertAdjacentHTML(
                        'beforeend',
                        '</br><tr id="header-day-' + day + '" data-day="' + day + '"><td class="schedule-day" colspan="4"><i class="material-icons open" draggable="false">keyboard_arrow_down</i>'
                        + DAYS_OF_WEEK[currentDay] + '</td></tr>' +
                        `<tr class="schedule-interactive schedule-day-` + day + `">
                            <th>Event</th>
                            <th>Time</th>
                            <th>Location</th>
                        </tr>`
                    );
                        document.querySelector(scheduleId + ' #header-day-' + day).addEventListener('click', function() {
                        toggleDay(scheduleId, this.attributes['data-day'].value);
                    });

                    console.log(event.summary);
                    console.log(currentTime.isAfter(event.end.dateTime));
                    prevCurrentDay = currentDay;
                }
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

            const clickable = event.description;

            let rowHTML = trString + `class="${clickable ? "schedule-interactive " : ""}schedule-day-`+ day + oldClass + '">';
            let titleEntry = `<td>${event.summary} ${clickable ? '<i class="material-icons schedule-icon">info</i>' : ""}</td>`;
            rowHTML += titleEntry;
            schedule.insertAdjacentHTML('beforeend', rowHTML + '<td></td><td></td></tr>');

            eventValues = [
                timeString,
                location
            ];
            document.querySelectorAll(scheduleId + ' > table > tbody > tr:last-child > td')
                .forEach(function(item, index) {
                    if (index == 0) return;
                    else item.textContent = eventValues[index - 1];
                });

            const rowEl = document.querySelector(scheduleId + ' > table > tbody > tr:last-child');
            if (clickable) {
                rowEl.addEventListener('click', () => {
                    popInfoModal(event);
                });
            }
        }
    }

    function popInfoModal(event) {
        const modal = document.getElementById("schedule-modal");
        if (!modal) window.alert("Sorry, something went wrong.");
        modal.style.display = "block";
        const { summary, location, start, end, slide_link, survey_link, code_link, prereqs, description, people, partner } = event;
        const modalContent = document.getElementById("schedule-modal-content");
        while (modalContent.firstChild) {
            modalContent.removeChild(modalContent.firstChild);
        }
        if (summary) {
            const summaryString = `<h4 class="modal-header">${summary}</h4>`;
            modalContent.insertAdjacentHTML('beforeend', summaryString);
        }
        if (location || start) {
            modalContent.insertAdjacentHTML('beforeend', '<div class="modal-row"></div>')
            if (location) {
                const locationString = `<h5 class="modal-item" >${location}</h5>`;
                modalContent.lastElementChild.insertAdjacentHTML('beforeend', locationString);
            }
            if (start) {
                let modalTime = start.pretty;
                if (end && start.pretty !== end.pretty) {
                    modalTime += ' - ' + event.end.pretty;
                }
                const timeString = `<h5 class="modal-time">${modalTime}</h5>`;
                modalContent.lastElementChild.insertAdjacentHTML('beforeend', timeString);
            }
        }

        if (description) {
            const descriptionString = `<p>${description}</p>`;
            modalContent.insertAdjacentHTML('beforeend', descriptionString);
        }
        if (slide_link || code_link || survey_link) {
            modalContent.insertAdjacentHTML('beforeend', '<h4>Resources</h4>');
            modalContent.insertAdjacentHTML('beforeend', '<div class="modal-row"></div>')
            if (slide_link) {
                const slideString = `<a class="modal-item" href="${slide_link}">Slides</p>`;
                modalContent.lastElementChild.insertAdjacentHTML('beforeend', slideString);
            }
            if (code_link) {
                const codeString = `<a class="modal-item" href="${code_link}">Code</p>`;
                modalContent.lastElementChild.insertAdjacentHTML('beforeend', codeString);
            }
            if (survey_link) {
                const surveyString = `<a class="modal-item" href="${survey_link}">Survey</p>`;
                modalContent.lastElementChild.insertAdjacentHTML('beforeend', surveyString);
            }
        }
        if (prereqs && prereqs.trim() !== "") {
            const prereqsString = `<p><strong>Prerequisites</strong>: ${prereqs}</p>`;
            modalContent.insertAdjacentHTML('beforeend', prereqsString);
        }
        if (partner && partner.trim() !== "") {
            const partnerString = `<p><strong>Partner</strong>: ${partner}</p>`;
            modalContent.insertAdjacentHTML('beforeend', partnerString);
        }
        if (people && people.trim() !== "") {
            const presentersString= `<p><strong>Presenter${people.length > 1 ? 's': ''}</strong>: ${people.join(", ")}</p>`;
            modalContent.insertAdjacentHTML('beforeend', presentersString);
        }

    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById("schedule-modal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    const modalX = document.getElementById("modal-close");
    if (modalX) {
        modalX.addEventListener('click', function() {
            const modal = document.getElementById("schedule-modal");
            modal.style.display = "none";
        });
    }

    getCalendarDataFromCMS();
})();
</script>
