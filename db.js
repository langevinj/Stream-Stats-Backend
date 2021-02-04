"use strict";

/** Database setup for stream-stats */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const testSetup = process.env.NODE_ENV === "test" ? { connectionString: getDatabaseUri()} : { connectionString: getDatabaseUri(),
    ssl: {
    rejectUnauthorized: false
}}

const db = new Client(testSetup);

db.connect();

module.exports = db;