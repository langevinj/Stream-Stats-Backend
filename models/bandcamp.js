"use strict";

const db = require("../db");
const { bandcampParser } = require('../helpers/parsers');

/** Functions for bandcamp. */

class Bandcamp {

    //parse the raw data from the user
    static async processRawImport({ page, username }) {

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await bandcampParser(page, username);
        let allQueries = [];

        //insertion into DB for all time data
        for(let dataset of formattedArray){
            try {
                let result = db.query(
                    `INSERT INTO bandcamp_all_time
                    (title, plays, complete, partial, skip, username)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING username`, [dataset.title, dataset.plays, dataset.complete, dataset.partial, dataset.skip, username]
                );
                allQueries.push(result);
            } catch (err) {
                throw new Error("Error importing data.");
            }
        }

        //wait for all insertion to complete 
        await Promise.all(allQueries);
        let response = `The Bandcamp data has been saved!`
        console.log(response);
        return response;
    }
}


module.exports = Bandcamp;