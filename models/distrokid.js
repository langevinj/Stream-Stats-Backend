const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const fs = require("fs")

/** Functions for distrokid. */

class Distrokid {

    //parse the raw data from the user
    static async processRawImport({ page, username }) {
        await fs.writeFile('distrokid.txt', page, 'utf8', (err) => {
            if(err) throw err;
            console.log('The file has been saved!');
        });
        let rawArray = []
        await fs.readFile('./distrokid.txt', function (err, data) {
            if (err) throw err;
            rawArray = data.toString().split("\n");
            // console.log(array[400])
            // for (let i of array) {
            //     console.log(i);
            // }
            filterFurther(rawArray);
        });

        let filter1;
        let fullData = [];
        //remove the start and end of the page
        async function filterFurther(arr){
            filter1 = arr.filter(line => !line.includes("100% of team"));
            let startIndex = filter1.findIndex(checkForTableStart);
            
            //remove the start of the table
            filter1.splice(0, startIndex + 1);

            let endIndex = filter1.findIndex(checkForTableEnd);

            //remove the end of the page
            filter1.splice(endIndex, filter1.length - 1);

            for (let row of filter1) {
                //split the row by breaks
                let t = row.split('\t');
                let tempObj = { "reportingMonth": t[0], "saleMonth": t[1], "store": t[2], "title": t[4], "quantity": t[5], "releaseType": t[6], "paid": t[7], "saleCountry": t[8], "earnings": t[9] }
                fullData.push(tempObj)
            }

            await insertIntoDB(fullData);
        }
        
        //this whole filtering process should be cleaned up for time complexity reasons
        function checkForTableStart(line){
            return line.includes('REPORTING MONTH');
        }

        function checkForTableEnd(line){
            return line.includes('Some info about earnings');
        }

        async function insertIntoDB(data){
            let allQueries = []
            for(let dataset in data){
                const result = db.query(
                    `INSERT INTO distrokid
                    (username, reporting_month, sale_month, store, title, quantity, release_type, paid, sale_country, earnings)
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        username,
                        dataset.reportingMonth,
                        dataset.saleMonth,
                        dataset.store,
                        dataset.title,
                        praseInt(dataset.quantity),
                        dataset.releaseType,
                        dataset.paid,
                        dataset.saleCountry,
                        parseFloat(dataset.earnings.substring(1))
                    ],
                );
                allQueries.push(result);
            }

            await Promise.all(allQueries);
            console.log("The Distrokid data has been saved!");
        }
        
        
        

        
    }
}

module.exports = Distrokid;