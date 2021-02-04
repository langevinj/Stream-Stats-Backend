"use strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const spotifyDataSchema = require("../schemas/spotifyData.json");
const { crawlSFA } = require("../s/spotifyForArtists/main");
const { spotifyParser } = require("../helpers/parsers");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Functions for Spotify */

/** The data uses for this portion of the application comes directly from Spotify for Artists
 * https://artists.spotify.com/
 * Without this data, this portion of the application would not be possible.
*/

class Spotify {

    /**Save a users Spotify credentials. Currently not in use.
     * 
    */
    static async saveUserCredentials({ email, password, username }){

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

    //Crawl the user's Spotify for Artists account and save data.
    static async crawlAndSave(email, password, username){
        //Once the application is saving a user's credentials, that information should be referenced here.

        //Helper function to call the actual crawl and catch misc. errors.
        async function crawlForData(email, password, username){
            try{
                const crawlRes = await crawlSFA({ email, password, username });
                if (crawlRes === "LOGIN ERROR") throw new BadRequestError("Invalid email or password.");
                return crawlRes;
            } catch (error){
                console.log(error);
                throw new BadRequestError("Error gathering data from Spotify for Artists. Please try again or manually paste the data.");
            }
        }

        //Call the initial crawl and save the response.
        const crawlResponse = await crawlForData(email, password, username);
        
        //Parse the data returned from the crawl.
        const parsedData = JSON.parse(crawlResponse);
        const monthData = parsedData['30days'];
        const allTimeData = parsedData.allTime;

        //Helper function for removing a user's older data from the table.
        async function removeOldData(table, username){
            try {
                await db.query(
                    `DELETE FROM ${table}
                    WHERE username = $1`, [username]
                );
            } catch (err) {
                throw new Error("Unable to delete old data.");
            }
        }

        //Prepare table for new data import by deleting old data.
        if(monthData) await removeOldData('spotify_running', username);
        if(allTimeData) await removeOldData('spotify_all_time', username);

        //Helper function for adding data to the spotify tables.
        async function addDataToDb(data, table, username){
            const allQueries = [];
            let fails = 0;

            for(let dataset of data){
                const validator = jsonschema.validate(dataset, spotifyDataSchema);
                if(!validator){
                    fails++;
                } else {
                    try {
                        const result = db.query(
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

            //Wait for all the insertions to finish.
            await Promise.all(allQueries);

            return fails;
        }

        //Add both sets of data to the DB.
        const monthInsertResponse = await addDataToDb(monthData, 'spotify_running', username);
        const alltimeInsertResponse = await addDataToDb(allTimeData, 'spotify_all_time', username);

        //Handle import errors.
        if(alltimeInsertResponse!== 0 && monthInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists 28 day and all time data. Try again manually.");
        } else if (alltimeInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists all time data. Try again manually.");
        } else if (monthInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists 28 day data. Try again manually.");
        }

        //If everything goes well, return the success message.
        return "Spotify all time and 28days from login";
}


    //Process raw page pasted by the user, this is only utlizing a small portion of the data currently.
    static async processRawImport(data, username){
        const { page, range } = data;
        //if the page is empty, return without doing any work
        if(!page) return;

        //Call the helper to format the raw data.
        const formattedArray = await spotifyParser(page, username, range);

        const allQueries = [];
        let count = 0;
        let fails = 0;
        const table = range === "alltime" ? 'spotify_all_time' : 'spotify_running'
        const correctRange = range === "alltime" ? "All time" : "28 days";

        if (!formattedArray.length) {
            throw new BadRequestError(`Error importing Spotify ${correctRange} data. Please try to copy and paste again.`);
        }

        for(let dataset of formattedArray){
            const validator = jsonschema.validate(dataset, spotifyDataSchema);
            if(!validator.valid){
                fails++;
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

        //Wait for all insertions to finish.
        await Promise.all(allQueries);

        if(fails !== 0) throw new BadRequestError(`Error importing ${fails} lines of Spotify ${correctRange} data. Please try to copy and paste again.`);

        const response = range === "alltime" ? "Spotify All Time" : "Spotify 28 days";
        return response;
    }

    /**Given a user's username get all their spotify data from the DB. */
    static async getUserSpotifyData(range, username){
        const userRes = await db.query(
            `SELECT username, is_admin as "isAdmin"
            FROM users
            WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];

        //Throw an error if the specified user doesn't exist.
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