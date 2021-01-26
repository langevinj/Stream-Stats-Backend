"use strict"

const jsonschema = require("jsonschema");
const db = require("../db");
const distrokidDataSchema = require("../schemas/distrokidData.json")
const { BadRequestError } = require("../expressError");

const { distrokidParser } = require('../helpers/parsers') 

/** Functions for distrokid. */

class Distrokid {

    //parse the raw data from the user
    static async processRawImport(page, username) {
        if(!page){
            // return `No data provided for distrokid`
            return 
        } 

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await distrokidParser(page, username);

        // if(!formattedArray.length){
        //     throw new Error("The distrokid data you provided was incorrectly formatted. Please try pasting again.")
        // }

        //remove outdated info from db before inputting new data
        if(formattedArray[0]){

         try{
             let res = await db.query(
                 `DELETE FROM distrokid
                WHERE username = $1`, [username]
             );
        } catch (err){
            throw new Error("Unable to delete old data.")
        }
            
        }

        await insertIntoDB(formattedArray);

        async function insertIntoDB(formattedArray){
            let allQueries = []
            let count = 0;
            let fails = 0;

            for(let dataset of formattedArray){
                    const validator = jsonschema.validate(dataset, distrokidDataSchema);
                    if(!validator.valid){
                        fails++;
                    } else {
                        if (dataset.earnings !== undefined) {
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
                    }
            }

            

            await Promise.all(allQueries);

            if (fails !== 0) throw new BadRequestError(`Error importing ${fails} distrokid lines. Please try again.`);

            // let response = `The Distrokid data has been saved! ${count} lines processed.`
            let response = "Distrokid"
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

        let result;

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
            //get the string for the current date
            // let currDate = new Date();
            // let str = currDate.toISOString().substring(0, 10);
            
            
        }
        
        //get a list of all the applicable stores
        const storesRes = await db.query(
            `SELECT store 
            FROM distrokid
            GROUP BY store`
        );
        
        
        

        return result;
    }
}

module.exports = Distrokid;