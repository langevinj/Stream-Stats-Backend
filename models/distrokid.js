"use strict"

const jsonschema = require("jsonschema");
const db = require("../db");
const distrokidDataSchema = require("../schemas/distrokidData.json");
const { BadRequestError, NotFoundError } = require("../expressError");
const { distrokidParser } = require('../helpers/parsers'); 

/** Functions for distrokid. */

/**The data used for these functions comes directly from Distrokid's 'Bank' page
 * https://distrokid.com/
 * Without the statistics gathered from Distrokid this application would not be possible.
*/

class Distrokid {

    //Parse the raw data from the user.
    static async processRawImport(page, username) {
        if(!page) return

        /**Call helper function to format all the data.
         *      returns array of objects containing each dataset
        */
        let formattedArray = await distrokidParser(page, username);
        
        if(!formattedArray.length){
            throw new Error("The distrokid data you provided was incorrectly formatted. Please try copy and pasting again.")
        }

        //Remove outdated info from db before inserting new data.
        if(formattedArray[0]){
            try{
                await db.query(
                 `DELETE FROM distrokid
                WHERE username = $1`, [username]
                );
            } catch (err){
                throw new Error("Unable to delete old data.");
            } 
        }


        const allQueries = []
        let count = 0;
        let fails = 0;

        //Iterate through array of fomatted data and insert it into the DB.
        for(let dataset of formattedArray){
                const validator = jsonschema.validate(dataset, distrokidDataSchema);
                if(!validator.valid){
                    fails++;
                } else {
                    if (dataset.earnings !== undefined) {
                        let result = db.query(
                                `INSERT INTO distrokid
                                (username, reporting_month, sale_month, store, title, quantity, release_type, paid, sale_country, earnings)
                                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                                RETURNING username`,
                                [
                                    username,
                                    dataset.reportingMonth,
                                    dataset.saleMonth,
                                    dataset.store,
                                    dataset.title,
                                    parseInt(dataset.quantity),
                                    dataset.releaseType,
                                    dataset.paid,
                                    dataset.saleCountry,
                                    parseFloat(dataset.earnings.substring(1))
                                ],
                            );
                        count++;
                        allQueries.push(result);
                    }
                }
        }

        //Wait for all the insertions to finish.
        await Promise.all(allQueries)

        //Raise any import errors.
        if (fails !== 0) {
            throw new BadRequestError(`Error importing ${fails} distrokid lines. Please try copy and pasting again.`)
        } else {
            return "Distrokid"
        }
    }


    //Give a username, get that user's Distrokid data.
    static async getUserDistrokidData(username, range="alltime"){
        const userRes = await db.query(
            `SELECT username, is_admin as "isAdmin"
            FROM users
            WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];
        if (!user) throw new NotFoundError(`No user: ${username}`);

        let result;
        
        //This conditional leaves room for further more specific range work.
        if(range === "alltime"){
            const distrokidRes = await db.query(
                `SELECT title, store, SUM(quantity) AS plays, SUM(earnings) as profit
            FROM distrokid
            WHERE username = $1
            GROUP BY store, title
            ORDER BY plays DESC`, [username]
            );

            result = distrokidRes.rows;
        } else {
            throw new BadRequestError(`Sorry, we only support all time Distrokid data currently.`)
        }
        
        return result;
    }
}

module.exports = Distrokid;