"use strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const spotifyDataSchema = require("../schemas/spotifyData.json");
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
            if(crawlRes === "LOGIN ERROR") throw new BadRequestError("Invalid email or password.")
            // /parse the returned data
            let data = JSON.parse(crawlRes);
            let monthData = data['30days'];
            let allTimeData = data['allTime'];

            //remove old data from the tables before importing new data
            if(monthData){
                try {
                    let res = await db.query(
                        `DELETE FROM spotify_running
                        WHERE username = $1`, [username]
                    );
                } catch (err){
                    throw new Error("Unable to delete old data");
                }
            }

            if(allTimeData){
                try {
                    let res = await db.query(
                        `DELETE FROM spotify_all_time
                        WHERE username = $1`, [username]
                    );
                } catch (err) {
                    throw new Error("Unable to delete old data");
                }  
            }

            let allMonthQueries = [];
            let monthFails = 0;
            //enter the past 28days data into the DB
            for (let dataset of monthData) {
                const validator = jsonschema.validate(dataset, spotifyDataSchema);
                if(!validator.valid){
                    monthFails++;
                } else {
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
            }

            //wait for the month queries to finish
            await Promise.all(allMonthQueries);

            let allTimeQueries = [];
            let allTimeFails = 0;
            //enter the alltime data
            for (let dataset of allTimeData) {
                const validator = jsonschema.validate(dataset, spotifyDataSchema);
                if(!validator.valid){
                    allTimeFails++;
                } else {
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
            }
            //wait for all queries to complete
            await Promise.all(allTimeQueries);

            //handle import errors
            if(allTimeFails !== 0 && monthFails !== 0){
                throw new BadRequestError("Error importing Spotify for Artists 28 day and all time data. Try again manually.");
            } else if (allTimeFails !== 0){
                throw new BadRequestError("Error importing Spotify for Artists all time data. Try again manually.");
            } else if (monthFails !== 0){
                throw new BadRequestError("Error importing Spotify for Artists 28 day data. Try again manually.");
            }

            let response = "Spotify All time and 28days from login"
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
        let fails = 0;
        let table = range === "alltime" ? 'spotify_all_time' : 'spotify_running'
        let correctRange = range === "alltime" ? "All time" : "28 days";

        if (!formattedArray.length) {
            throw new BadRequestError(`Error importing Spotify ${correctRange} data. Please try again.`);
        }


        for(let dataset of formattedArray){
            const validator = jsonschema.validate(dataset, spotifyDataSchema);
            if(!validator.valid){
                fails++
            } else {
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
        }

        await Promise.all(allQueries);

        if(fails !== 0) throw new BadRequestError(`Error importing ${fails} lines of Spotify ${correctRange} data. Please try again.`);

        // let response = `The Spotify data has been saved! ${count} lines processed`
        let response = range === "alltime" ? "Spotify All Time" : "Spotify 28 days";
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