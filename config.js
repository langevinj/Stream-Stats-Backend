"use strict";

/** Shared config for application */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 5000;

//set database depending on situation
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
    ? "stream_stats_test" 
    : process.env.DATABASE_URL || "stream_stats"
}

//Speed up bcrypt during tests since the algorithmic safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 13;

// console.log("Stream-Stat Config:");
// console.log("SECRET_KEY:");
// console.log("PORT:");
// console.log("BCRYPT_WORK_FACTOR", BCRYPT_WORK_FACTOR);
// console.log("Database:", getDatabaseUri());
// console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
};