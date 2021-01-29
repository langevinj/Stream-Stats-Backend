"use strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const { bandcampParser } = require('../helpers/parsers');
const { NotFoundError, BadRequestError } = require('../expressError');
const bandcampDataSchema = require("../schemas/bandcampData.json");

/** Functions for bandcamp. */

class Bandcamp {

    //Parse the raw data from the user.
    static async processRawImport(data, username) {
        const { page, range } = data;
        if(!page) return;

        /**Call helper function to format all the data.
         *      returns: array of objects containing each dataset.
        */
        const formattedArray = await bandcampParser(page, username);
        let allQueries = [];
        let count = 0;
        let fails = 0;
        const correctRange = range === "alltime" ? "All time" : "30 days";
        const table = range === "alltime" ? 'bandcamp_all_time' : 'bandcamp_running';
        
        if (formattedArray.length) {
            //Remove soon to be outdated entries from the users db.
            try {
                const result = await db.query(
                    `DELETE FROM ${table}
                    WHERE username = $1`, [username]
                );
            } catch (err) {
                throw new BadRequestError("Failure to remove old data!");
            }
        } else {
            throw new BadRequestError(`Error with the bandcamp data imported for ${correctRange}.`);
        }

        //Insert the new data into the DB.
        for(let dataset of formattedArray){
            const validator = jsonschema.validate(dataset, bandcampDataSchema);
            if(!validator.valid){
                fails++;
            } else {
                count++;
                try {
                    let result = db.query(
                        `INSERT INTO ${table}
                        (title, plays, complete, partial, skip, username)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING username`, [dataset.title, dataset.plays, dataset.complete, dataset.partial, dataset.skip, username]
                    );
                    allQueries.push(result);
                } catch (err) {
                    throw new Error("Error importing data.");
                }
            }
        }

        //Wait for all insertions to complete.
        await Promise.all(allQueries);

        //If there are any fails in the, throw an error.
        if(fails !== 0){
            throw new BadRequestError(`Error importing ${fails} bandcamp lines for the ${correctRange} page. Please recopy the page and try again.`);
        }

        // let response = `The Bandcamp data has been saved! ${count} lines processed`
        const response = range === "alltime" ? "Bandcamp all time" : "Bandcamp 30 days";
        return response;
    }

    /**Get the Bandcamp data associate with a particular user. */
    static async getUserBandcampData(username, range = "alltime"){
        //Check that a user with the given username exists, if not throw an error.
        let userRes = await db.query(
            `SELECT username, is_admin as "isAdmin"
            FROM users
            WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];
        if(!user) throw new NotFoundError(`No user: ${username}`);

        const table = range === "alltime" ? 'bandcamp_all_time' : 'bandcamp_running';

        const bandcampRes = await db.query(
            `SELECT title, plays, complete, partial, skip
            FROM ${table}
            WHERE username = $1
            ORDER BY plays DESC
            LIMIT 10`, [username]
        );

        return bandcampRes.rows;
    }
}


module.exports = Bandcamp;