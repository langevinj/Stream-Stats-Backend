"use strict"

const db = require("../db");
const fs = require("fs");

const { distrokidParser } = require('../helpers/parsers') 

/** Functions for distrokid. */

class Distrokid {

    //parse the raw data from the user
    static async processRawImport(page, username) {

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await distrokidParser(page, username);

        await insertIntoDB(formattedArray);

        async function insertIntoDB(formattedArray){
            let allQueries = []
            let count = 0;
            for(let dataset of formattedArray){
                try{
                    if(dataset.earnings !== undefined){
                        let result = db.query(
                            `INSERT INTO distrokid
                        (username, reporting_month, sale_month, store, title, quantity,     release_type, paid, sale_country, earnings)
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
                } catch (err){
                    throw new Error("Error importing data.")
                }
            }

            await Promise.all(allQueries);
            let response = `The Distrokid data has been saved! ${count} lines processed.`
            console.log(response)
            return response;
        }
    }

    static async getUserDistrokidData(range="alltime", username){
        const userRes = await db.query(
            `SELECT username, is_admin as "isAdmin"
            FROM users
            WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
        
        //get a list of all the applicable stores
        const storesRes = await db.query(
            `SELECT store 
            FROM distrokid
            GROUP BY store`
        );
        
        
        const distrokidRes = await db.query(
            `SELECT title, store, SUM(quantity) AS plays, SUM(earnings) as profit
            FROM distrokid
            WHERE username = $1
            GROUP BY store, title
            ORDER BY title`, [username]
        );
        console.log(`Distrokidres is ${distrokidRes.rows}`);
        return distrokidRes.rows;
    }
}

module.exports = Distrokid;