---
title: StatGT API
---

For HackGT 5: Dare to Venture, we're introducing an API all about HackGT and its participants! We hope this encourages you to think of projects about improving the hackathon experience, interacting with other participants using NFC badges, and more!

The API features two endpoints:
1. `https://stats.dev.hack.gt/api/tags` returns aggregate counts of checked in participants per event. Sample response:
```
{
    <event name>: <number of participants>
}
```
2. `https://stats.dev.hack.gt/api/<userID>` returns basic information about a participant, given the user's registration account ID. This returns JSON with the following fields: 
  * name
  * email
  * school
  * school year
  * major
  * github
  * website
  * tags: list of events a user has been checked in for