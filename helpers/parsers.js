
const fs = require("fs");
const { distrokidDateConverter } = require('./dates');

//turns each row into a valid object, returns an array containing all rows
function formatDistrokidData(array){
    return array.map(row => {
        let t = row.split('\t');
        
        if(t.length < 6) return t;

        //converter the dates into the correct format for SQL insertion
        let validReportingMonth = distrokidDateConverter(t[0]);
        let validSaleMonth = distrokidDateConverter(t[1]);

        return { "reportingMonth": validReportingMonth, "saleMonth": validSaleMonth, "store": t[2], "title": t[4], "quantity": t[5], "releaseType": t[6], "paid": t[7], "saleCountry": t[8], "earnings": t[9] }
    });
}

//helper function for parsing a raw distrokid page
async function distrokidParser(rawData){  
    //helper function for finding start of the dataset
    function checkForTableStart(line) {
        return line.includes('REPORTING MONTH');
    }

    //helper function for finding end of the dataset
    function checkForTableEnd(line) {
        return line.includes('Some info about earnings');
    }

    //write a new .txt file for the raw data
    await fs.writeFile(`./rawPages/distrokid.txt`, rawData, 'utf8', (err) => {
        if (err) throw err;
    });

    //read in the data from the file that was written
    const rawContent = fs.readFileSync('./rawPages/distrokid.txt', 'utf8');

    //create an array where each line is a new element and remove non-important text
    let rawArray = rawContent.toString().split("\n").filter(line => !line.includes("100% of team"));

    //remove the start of the page
    let startIdx = rawArray.findIndex(checkForTableStart);
    rawArray.splice(0, startIdx + 1);

    //remove the end of the page
    let endIdx = rawArray.findIndex(checkForTableEnd);
    rawArray.splice(endIdx);

    return formatDistrokidData(rawArray)
}

module.exports =  { distrokidParser }