/**Helper functions for parsing raw pages */

const fs = require("fs");
const { distrokidDateConverter, getDaysInMonth} = require('./dates');

/**
 * Currently setup to work with the distrokid tsv. Not the webpage.
 */
function formatDistrokidData(array){
    return array.map(row => {
        let t = row.split('\t');
        
        if(t.length < 6) return t;

        /**
         * When parsing the webpage, convert the dates to the correct format for SQL insertion
         */
        // let validReportingMonth = distrokidDateConverter(t[0]);
        // let validSaleMonth = distrokidDateConverter(t[1]);

        //For the tsv paste import, the dates most also be formatted correctly
        const dateVals = t[1].split("-");
        const month = parseInt(dateVals[1]);
        const year = parseInt(dateVals[0]);
        const lastDayOfMonth = getDaysInMonth(month, year);

        //Paid set to 0 currently, to account for n/a
        return { "reportingMonth": t[0], "saleMonth": `${t[1]}-${lastDayOfMonth}`, "store": t[2], "title": t[4], "quantity": t[7], "releaseType": t[9], "paid": "0", "saleCountry": t[10], "earnings": t[12] }
    });
}

/**
 * Distrokid parser
 * 
 *      Given the pasted tsv of stream data from Distrokid. Parse it and prep it for insertion. 
 * 
 * returns an array of objects
 */
async function distrokidParser(rawData, username){  

    //String identifiers of the start/end of the table, end is currently irrelavent as set up.
    const tableStart = 'Earnings (';
    // const tableEnd = 'Some info about earnings'

    //Write a new .txt file with the raw data.
    fs.writeFileSync(`./rawPages/distrokid-${username}.txt`, rawData, {'encoding': 'utf8', 'flag': 'w'}, (err) => {
        if (err) throw err;
    });

    //Read in the file that was written.
    const rawContent = fs.readFileSync(`./rawPages/distrokid-${username}.txt`, 'utf8');

    //Create an array where each line is a new dataset and remove non-important text.
    let rawArray = rawContent.toString().split("\n").filter(line => !line.includes("100% of team"));

    //Remove the start of the page.
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx + 1);

    //Remove the end of the page
    // let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    // rawArray.splice(endIdx - 2);

    return formatDistrokidData(rawArray);
}

/**Bandcamp parser
 * 
 *      Given the pasted page from Bandcamp. Parse it and prep it for insertion.
 */
async function bandcampParser(rawData, username){
    //If the username is not provided. Do not parse.
    if(typeof(username) !== 'string') return

    //String identifiers of the start/end of the table.
    const tableStart = 'Total plays';
    const tableEnd = 'play means the track was played'

    //Write a new .txt file with the raw data.
    fs.writeFileSync(`./rawPages/bandcamp-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
        if (err) throw err;
    });

    //Read in the data from the file that was written/
    const rawContent = fs.readFileSync(`./rawPages/bandcamp-${username}.txt`, 'utf8');
    
    //Create an array where each line is a new element.
    let rawArray = rawContent.toString().split("\n");

    //Remove the start of the page.
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx + 3);

    //Remove the end of the page.
    let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    rawArray.splice(endIdx);

    /**Trim the raw array down to an array containing strings for each track
     *          Each string contains: track title, total streams, complete, partial, and skip stats.
     * */
    const justTracks = [];
    let count = 0;
    let idx = 0;
    while(idx < rawArray.length){
        if(count === 0){
            count++;
        } else if (count === 1){
            justTracks.push(rawArray[idx] + rawArray[idx + 1]);
            count++;
        } else if (count === 3) {
            count = 0;
        } else {
            count++;
        }
        idx++;
    }

    let formattedData = [];

    //Format the data for each song into an array of objects.
    for(let el of justTracks){
        let temp = el.split("\t").filter(Boolean);

        //Create an object for the track entry.
        let tempObject = { "title": temp[0], "plays": parseInt(temp[1]) || 0, "complete": parseInt(temp[2]) || 0, "partial": parseInt(temp[3]) || 0, "skip": parseInt(temp[4]) || 0}

        //Add the track entry into the final array.
        formattedData.push(tempObject);
    }

    return formattedData
}

/** Spotify parser
 * 
 *      Given a pasted page from Spotify for Artists and the range for that page. Parse it and prep for insertion.
 */
async function spotifyParser(rawData, username, range){

    //String identifiers of the start/end of the table.
    const tableStart = range === "month" ? 'Last 28 days' : 'All time';
    const tableEnd = 'Spotify AB';

    //Write a new .txt file for the raw data.
    if(range === "month"){
        fs.writeFileSync(`./rawPages/spotify-month-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
            if (err) throw err;
        });
    } else if (range === "alltime") {
        fs.writeFileSync(`./rawPages/spotify-alltime-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
            if (err) throw err;
        });
    }
    

    //Read in the data from the file that was written.
    let rawContent;
    if (range === "month") {
        rawContent = fs.readFileSync(`./rawPages/spotify-month-${username}.txt`, 'utf8');
    } else if (range === "alltime") {
        rawContent = fs.readFileSync(`./rawPages/spotify-alltime-${username}.txt`, 'utf8');
    }
    
    //Create an array where each line of the data is a new element.
    let rawArray = rawContent.toString().split("\n").filter(Boolean);

    //Remove the start of the page from the array.
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx + 2);
    
    //Remove the end of the page from the array.
    let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    rawArray.splice(endIdx - 3);

    /**Trim the raw array down to an array containing strings for each track
     *      This is similar to the bandcamp parser. But the data comes in formatted differently. 
     * */
    let justTracks = [];
    let count = 0;
    let idx = 0;
    while (idx < rawArray.length) {
        if (count === 0) {
            count++;
        } else if (count === 1) {
            justTracks.push(rawArray[idx] + '\t' + rawArray[idx + 1]);
            count++;
        } else if (count === 2) {
            count = 0;
        } else {
            count++;
        }
        idx++;
    }

    let formattedData = [];
    
    //Format the data for each song into an array of objects.
    for (let el of justTracks) {
        let temp = el.split("\t").filter(Boolean);

        //Create an object for the track entry.
        let tempObject = { "title": temp[0], "streams": parseInt(temp[1]) || 0, "listeners": parseInt(temp[2]) || 0, "views": parseInt(temp[3]) || 0, "saves": parseInt(temp[4]) || 0 }

        formattedData.push(tempObject);
    }

    return formattedData
}

module.exports =  { distrokidParser, bandcampParser, spotifyParser }