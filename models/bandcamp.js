"use strict";

const db = require("../db");
const { bandcampParser } = require('../helpers/parsers');
const { NotFoundError } = require('../expressError');

/** Functions for bandcamp. */

class Bandcamp {

    //parse the raw data from the user
    static async processRawImport(page, username, range) {

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await bandcampParser(page, username);
        let allQueries = [];
        let count = 0;
        //designate which table to insert into
        let table = range === "alltime" ? 'bandcamp_all_time' : 'bandcamp_running';

        //insertion into DB for all time data
        for(let dataset of formattedArray){
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

        //wait for all insertion to complete 
        await Promise.all(allQueries);
        let response = `The Bandcamp data has been saved! ${count} lines processed`
        console.log(response);
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
            FROM $1
            WHERE username = $2
            SORT BY plays DESC`, [table, username]
        );

        return bandcampRes.rows;
    }
}


module.exports = Bandcamp;