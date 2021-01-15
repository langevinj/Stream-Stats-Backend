"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { crawlSFA } = require("../s/spotifyForArtists/main");

const { BCRYPT_WORK_FACTOR } = require ("../config.js");
/** Functions for Spotify */

class Spotify {


    /**Save a users Spotify credentials */
    static async saveUserCredentials({ email, password, username }){
        //revisit hasing password when know how to decrypt
        // const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(
            `INSERT INTO spotify_credentials
            (email, password, username)
            VALUES ($1, $2, $3)
            RETURNING username`, 
            [
                email,
                password,
                username
            ],
        );
        const user = result.rows[0];

        return user;
    }

    static async crawlAndSave({ username, email, password }){
        //get the email and hashedPassword for the specified user
        // const res = await db.query(
        //     `SELECT email, password
        //     FROM spotify_credentials
        //     WHERE username=$1`, [username]
        // );

        // let password = res.rows[1].password;
        // let email = res.rows[0].email;

        //when security is added will have to decrypt password here
        // let unhashedPwd =
        
        //initiate the crawl
        let crawlRes = await crawlSFA({ email, password, username });


    }
}


module.exports = Spotify;