"use strict";

/** Database setup for stream-stats */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let localSetup;
if(process.env.NODE_ENV === "test" || !process.env.PORT){
    localSetup = {connectionString: getDatabaseUri()};
} else {
    localSetup = {
        connectionString: getDatabaseUri(),
            ssl: {
            rejectUnauthorized: false
        }
    }
}

const db = new Client(localSetup);

db.connect();

module.exports = db;