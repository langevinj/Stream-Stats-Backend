"use strict";

const db = require("../db.js");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM bandcamp_all_time");
    await db.query("DELETE FROM bandcamp_running");
    await db.query("DELETE FROM distrokid");
    await db.query("DELETE FROM spotify_all_time");
    await db.query("DELETE FROM spotify_running");

    await User.register({
        username: "u1",
        email: "user1@user.com",
        password: "password1",
        bandName: "band1",
        isAdmin: false
    });
    await User.register({
        username: "u2",
        email: "user2@user.com",
        password: "password2",
        bandName: "band2",
        isAdmin: false
    });
    await User.register({
        username: "u3",
        email: "user3@user.com",
        password: "password3",
        bandName: "band3",
        isAdmin: false
    });

    await db.query(`
        INSERT INTO bandcamp_all_time(title, plays, username)
        VALUES ('song1', $1, 'u1'),
               ('song2', $2, 'u1'),
               ('song3', $3, 'u2')`,
        [100, 200, 300]);

    await db.query(`
        INSERT INTO bandcamp_running(title, plays, username)
        VALUES ('song1', $1, 'u1'),
               ('song2', $2, 'u1'),
               ('song3', $3, 'u2')`,
        [15, 25, 55]);

    await db.query(`
        INSERT INTO distrokid(reporting_month, sale_month, store, title, quantity, release_type, sale_country, earnings, username)
        VALUES ('2019-10-24', '2019-09-30', 'applemusic', 'song1', $1, 'Song', 'US', $2, 'u1')`, [15, 0.0097586308]);

    await db.query(`
        INSERT INTO spotify_all_time(title, streams, username)
        VALUES ('song1', $1, 'u1'),
                ('song2', $2, 'u1'),
                ('song3', $3, 'u1'),
                ('song4', $4, 'u2')`, [1400, 2000, 50, 300]);

    await db.query(`
        INSERT INTO spotify_running(title, streams, username)
        VALUES ('song1', $1, 'u1'),
                ('song2', $2, 'u1'),
                ('song3', $3, 'u1'),
                ('song4', $4, 'u2')`, [200, 300, 50, 100]);
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmim: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
};