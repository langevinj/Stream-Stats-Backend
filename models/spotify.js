"use strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const spotifyDataSchema = require("../schemas/spotifyData.json");
const { crawlSFA } = require("../s/spotifyForArtists/main");
const { spotifyParser } = require("../helpers/parsers");
const { BadRequestError } = require("../expressError");

/** Functions for Spotify */

class Spotify {

    /**Save a users Spotify credentials. Currently not in use */
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

    //crawl the user's Spotify for Artists account and save data
    static async crawlAndSave(email, password, username){
        //Once the application is saving a user's credentials, that information should be referenced here

        //helper function to call the actual crawl and catch misc. errors
        async function crawlForData(email, password, username){
            try{
                const crawlRes = await crawlSFA({ email, password, username });
                if (crawlRes === "LOGIN ERROR") throw new BadRequestError("Invalid email or password.");
                return crawlRes
            } catch (error){
                console.log(error);
                throw new BadRequestError("Error gathering data from Spotify for Artists. Please try again or manually paste the data.");
            }
        }

        //call the initial crawl and save the response
        const crawlResponse = await crawlForData(email, password, username);
        
        
        //parse the data returned from the crawl
        const parsedData = JSON.parse(crawlResponse);
        const monthData = parsedData['30days'];
        const allTimeData = parsedData.allTime;

        //helper function for removing a user's older data from the table
        async function removeOldData(table, username){
            try {
                const res = await db.query(
                    `DELETE FROM ${table}
                    WHERE username = $1`, [username]
                );
            } catch (err) {
                throw new Error("Unable to delete old data.");
            }
        }

        //prepare table for new data import by deleting old data
        if(monthData) await removeOldData('spotify_running', username);
        if(allTimeData) await removeOldData('spotify_all_time', username);

        //helper function for adding data to the spotify tables
        async function addDataToDb(data, table, username){
            let fails = 0;
            const allQueries = [];

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

            //wait for all the queries to finish
            await Promise.all(allQueries);

            return fails;
        }

        //add both sets of data to the DB
        const monthInsertResponse = await addDataToDb(monthData, 'spotify_running', username);
        const alltimeInsertResponse = await addDataToDb(allTimeData, 'spotify_all_time', username);


        //handle import errors
        if(alltimeInsertResponse!== 0 && monthInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists 28 day and all time data. Try again manually.");
        } else if (alltimeInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists all time data. Try again manually.");
        } else if (monthInsertResponse !== 0){
            throw new BadRequestError("Error importing Spotify for Artists 28 day data. Try again manually.");
        }

        //if everything goes well, return the success message
        return "Spotify all time and 28days from login";
}


    //only handling partial data for now
    static async processRawImport(data, username){
        const { page, range } = data;
        //if the page is empty, return without doing any work
        if(!page){
            // return `No data was provided for spotify ${range}`
            return
        } 

        let formattedArray = await spotifyParser(page, username, range);

        let allQueries = [];
        let count = 0;
        let fails = 0;
        let failedSets = [];
        let table = range === "alltime" ? 'spotify_all_time' : 'spotify_running'
        let correctRange = range === "alltime" ? "All time" : "28 days";

        if (!formattedArray.length) {
            throw new BadRequestError(`Error importing Spotify ${correctRange} data. Please try again.`);
        }

        for(let dataset of formattedArray){
            const validator = jsonschema.validate(dataset, spotifyDataSchema);
            if(!validator.valid){
                fails++
                failedSets.push(dataset)
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

        console.log(failedSets)

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