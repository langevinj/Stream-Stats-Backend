"use strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const { bandcampParser } = require('../helpers/parsers');
const { NotFoundError, BadRequestError } = require('../expressError');
const bandcampDataSchema = require("../schemas/bandcampData.json");

/** Functions for bandcamp. */

class Bandcamp {

    //parse the raw data from the user
    static async processRawImport(data, username) {
        const { page, range } = data;
        if(!page){
            // console.log(`No data provided for bandcamp ${range}`);
            return `No data provided for bandcamp ${range}`
        } 

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await bandcampParser(page, username);
        let allQueries = [];
        let count = 0;
        let fails = 0;
        let correctRange = range === "alltime" ? "All time" : "30 days";
        //designate which table to insert into
        let table = range === "alltime" ? 'bandcamp_all_time' : 'bandcamp_running';

        if (formattedArray.length) {
            //remove soon to be outdated entries from the users db
            try {
                let result = await db.query(
                    `DELETE FROM ${table}
                    WHERE username = $1`, [username]
                );
            } catch (err) {
                throw new Error("Failure to remove old data!");
            }
        } else {
            throw new BadRequestError(`Error with the bandcamp data imported for ${correctRange}.`)
        }

        //insertion into DB for all time data
        for(let dataset of formattedArray){
            const validator = jsonschema.validate(dataset, bandcampDataSchema);
            if(!validator.valid){
                fails++
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

        //wait for all insertion to complete 
        await Promise.all(allQueries);

        if(fails !== 0){
            throw new BadRequestError(`Error importing ${fails} bandcamp lines for the ${correctRange} page. Try again.`);
        }

        
        // let response = `The Bandcamp data has been saved! ${count} lines processed`
        let response = range === "alltime" ? "Bandcamp all time" : "Bandcamp 30 days"
        return response;
    }

    static async getUserBandcampData(range="alltime", username){
        const userRes = await db.query(
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