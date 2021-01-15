"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { crawlSFA } = require("./s/spotifyForArtists/main");

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

    static async crawlAndSave({ username }){
        //get the email and hashedPassword for the specified user
        const res = await db.query(
            `SELECT email, password
            FROM spotify_credentials
            WHERE username=$1`, [username]
        );

        let pwd = res.rows[1];
        let email = res.rows[0];

        //when security is added will have to decrypt password here
        // let unhashedPwd =
        
        //initiate the crawl
        let res = await crawlSFA(email, pwd, username);


    }
}


module.exports = Spotify;