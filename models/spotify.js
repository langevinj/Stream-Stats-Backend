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
        //parse the returned data
        let data = JSON.parse(crawlRes);
        let monthData = data['30days'];
        let allTimeData = data['allTime'];

        let allMonthQueries = [];
        //enter the past 28days data into the DB
        for(let dataset of monthData){
            try {
                let result = db.query(
                    `INSERT INTO spotify_running
                    (title, streams, listeners, username)
                    VALUES ($1, $2, $3, $4)
                    RETURNING username`, [dataset.title, parseInt(dataset.streams) || 0, parseInt(dataset.listeners) || 0, username]
                );
                allMonthQueries.push(result);
            } catch (err) {
                throw err;
                throw new Error("Error importing data.");
            }
        }

        //wait for the month queries to finish
        await Promise.all(allMonthQueries);

        let allTimeQueries = [];
        //enter the alltime data
        for(let dataset of allTimeData) {
            try {
                let result = db.query(
                    `INSERT INTO spotify_all_time
                    (title, streams, listeners, username)
                    VALUES ($1, $2, $3, $4)
                    RETURNING username`, [dataset.title, parseInt(dataset.streams) || 0, parseInt(dataset.listeners) || 0, username]
                );
                allTimeQueries.push(result);
            } catch (err) {
                throw new Error("Error importing data.");
            }
        }
        //wait for all queries to complete
        await Promise.all(allTimeQueries);

        let response = `The Spotify data has been saved!`
        console.log(response);
        return response;
    }
}


module.exports = Spotify;