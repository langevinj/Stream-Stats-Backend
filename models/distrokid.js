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
    static async processRawImport({ page }) {
        await fs.writeFile('distrokid.txt', page, 'utf8', (err) => {
            if(err) throw err;
            console.log('The file has been saved!');
        });

        let fullData = {}
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
        //remove the start and end of the page
        async function filterFurther(arr){
            filter1 = arr.filter(line => !line.includes("100% of team"));
            let startIndex = filter1.findIndex(checkForTableStart);
            
            //remove the start of the table
            filter1.splice(0, startIndex + 1);

            let endIndex = filter1.findIndex(checkForTableEnd);

            //remove the end of the page
            filter1.splice(endIndex, filter1.length - 1);
        }
        
        //this whole filtering process should be cleaned up for time complexity reasons
        function checkForTableStart(line){
            return line.includes('REPORTING MONTH');
        }

        function checkForTableEnd(line){
            return line.includes('Some info about earnings');
        }
        
        // const filter2 = filter1.map(el => el.split("  "))
        // for (let el of filter2) {
        //     console.log(el)
        // }
    }
}

module.exports = Distrokid;