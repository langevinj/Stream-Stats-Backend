"use strict";

const db = require("../db");
const { crawlSFA } = require("../s/spotifyForArtists/main");
const { spotifyParser } = require("../helpers/parsers");
const { ExpressError, BadRequestError } = require("../expressError");

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

    static async crawlAndSave(email, password, username){
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
            if(crawlRes === "LOGIN ERROR") throw new BadRequestError("Invalid username or password.")
            // /parse the returned data
            let data = JSON.parse(crawlRes);
            let monthData = data['30days'];
            let allTimeData = data['allTime'];

            let allMonthQueries = [];
            //enter the past 28days data into the DB
            for (let dataset of monthData) {
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
                    // throw new Error("Error importing data.");
                }
            }

            //wait for the month queries to finish
            await Promise.all(allMonthQueries);

            let allTimeQueries = [];
            //enter the alltime data
            for (let dataset of allTimeData) {
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


    //only handling partial data for now
    static async processRawImport(data, username){
        const { page, range } = data;
        //if the page is empty, return without doing any work
        if(!page) return `No data was provided for spotify ${range}`

        let formattedArray = await spotifyParser(page, username, range);

        let allQueries = [];
        let count = 0;
        let table = range === "alltime" ? 'spotify_all_time' : 'spotify_running'

        for(let dataset of formattedArray){
            count++;
            try {
                let result = db.query(
                    `INSERT INTO ${table}
                    (title, streams, listeners, username)
                    VALUES ($1, $2, $3, $4)
                    RETURNING username`, [dataset.title, parseInt(dataset.streams) || 0, parseInt(dataset.listeners) || 0, username]
                );
                allQueries.push(result);
            } catch (err) {
                throw err;
            }
        }

        await Promise.all(allQueries);

        let response = `The Spotify data has been saved! ${count} lines processed`
        console.log(response);
        return response;
    }


    static async getUserSpotifyData(range, username){
        const userRes = await db.query(
            `SELECT username, is_admin as "isAdmin"
            FROM users
            WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const table = range === "alltime" ? 'spotify_all_time' : 'spotify_running';

        const spotifyRes = await db.query(
            `SELECT title, streams, listeners
            FROM ${table}
            WHERE username = $1
            ORDER BY streams DESC`, [username]
        );

        return spotifyRes.rows;
    }
}


module.exports = Spotify;