---
calendars:
    -
      title: Event
      id: lettersandnumbers@group.calendar.google.com
    -
      title: Tech Talks and Workshops
      id: lettersandnumbers@group.calendar.google.com
gcal:
  # All calendars on the same page must use the same API key and have the same start/end dates/times
  api_key: google_api_key
  start_datetime: "2018-02-22T18:00:00-0500" #Be sure to enclose this in quotes so Jekyll doesn't interpret as a Date!
  end_datetime: "2018-02-24T15:00:01-0500" #This is the absolute latest start time to include an event on the page.  The timestamp is exclusive, meaning that to include events at 3:00 PM, you would write T15:01:00 (includes events starting as late as 15:00:59)
title: Schedule
layout: schedule
priority: 2
---
