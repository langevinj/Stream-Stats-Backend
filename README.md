# Stream Stats - Backend :chart_with_upwards_trend:
The backend for the streaming visualization tool Stream Stats. You can [follow this link](https://github.com/langevinj/Stream-Stats-Frontend) to view the front end and [view the app here](https://stream-stats-frontend.herokuapp.com/).

## Table of Contents:
* [Description](#description)
* [Technologies](#technologies)
* [Testing](#testing)
* [Data Collection](#data-collection)

## Description:
This directory is used as both the API and backend for the Stream Stats web application. It contains authentication, routes for gathering and importing data as well as functions for formatting and scraping data.

## Technologies:
* Node.js
* Express
* Puppeteer
* File System
* Jsonschema
* PostgreSQL

## Data Collection:
At this time the majority of data collected from the user requires a copy-paste method where the user copies an entire webpage and pastes it into a form input. These pages are then parsed by helper functions and inserted into the database.

Currently, the use of Puppeteer allows the application to scrape a user's Spotify for Artists data given a valid username and password.

Although only data on plays, title, and streaming services are in use right now, in the future the application will move towards in-depth drill downs on all analytics avaible from the services being used.

## Testing:
To run the tests provided, first make sure to setup the SQL databases:
```
psql < stream-stats.sql
```

Then to run all tests, with your database active run:
```
jest
```

Or to test individual files run:
```
jest NAME_OF_TEST_FILE
```




