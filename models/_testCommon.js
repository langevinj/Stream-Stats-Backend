const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM bandcamp_all_time");
    await db.query("DELETE FROM bandcamp_running");
    await db.query("DELETE FROM distrokid");
    await db.query("DELETE FROM spotify_all_time");
    await db.query("DELETE FROM spotify_running");
    
    await db.query(`
        INSERT INTO users(username, password, email)
        VALUES ('u1', $1, 'u1@email.com'),
               ('u2', $2, 'u2@email.com')`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
        ]);

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

async function commonAfterAll(){
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
};