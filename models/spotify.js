"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require ("../config.js");

/** Functions for Spotify */

class Spotify {


    /**Save a users Spotify credentials */
    static async saveUserCredentials({ email, password, username }){
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(
            `INSERT INTO spotify_credentials
            (email, password, username)
            VALUES ($1, $2, $3)
            RETURNING username`, 
            [
                email,
                hashedPassword,
                username
            ],
        );
        const user = result.rows[0];

        return user;
    }
}


module.exports = Spotify;