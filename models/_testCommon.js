const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
    await db.query("DELETE FROM bandcamp_all_time");
    await db.query("DELETE FROM bandcamp_running");
    await db.query("DELETE FROM distrokd");
    await db.query("DELETE FROM spotify_all_time");
    await db.query("DELETE FROM spotify_running");
    await db.query("DELETE FROM users");

    await db.query(`
        INSERT INTO users(username, password, email)
        VALUES ('u1', $1, 'u1@email.com')
               ('u2', $2, 'u2@email.com')
        RETURING username`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
        ]);

    await db.query(`
        INSERT INTO bandcamp_all_time(title, plays, username)
        VALUES ('song1', $1, 'u1')
               ('song2', $2, 'u1')
               ('song3', $3, 'u2')
        RETURNING username`, 
        [100, 200, 300]);

    await db.query(`
        INSERT INTO bandcamp_running(title, plays, username)
        VALUES ('song1', $1, 'u1')
               ('song2', $2, 'u1')
               ('song3', $3, 'u2')
        RETURNING username`,
        [15, 25, 55]);
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