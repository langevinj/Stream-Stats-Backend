/**Helper functions for parsing raw pages */

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
async function distrokidParser(rawData, username){  

    //string identifiers of the start/end of the table
    const tableStart = 'REPORTING MONTH';
    const tableEnd = 'Some info about earnings'

    //write a new .txt file with the raw data
    fs.writeFileSync(`./rawPages/distrokid-${username}.txt`, rawData, {'encoding': 'utf8', 'flag': 'w'}, (err) => {
        if (err) throw err;
    });

    //read in the data from the file that was written
    const rawContent = fs.readFileSync(`./rawPages/distrokid-${username}.txt`, 'utf8');

    //create an array where each line is a new element and remove non-important text
    let rawArray = rawContent.toString().split("\n").filter(line => !line.includes("100% of team"));

    //remove the start of the page
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx + 1);

    //remove the end of the page
    let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    rawArray.splice(endIdx);

    return formatDistrokidData(rawArray)
}

//helper function for parsing a raw bandcamp page
async function bandcampParser(rawData, username){
    if(typeof(username) !== 'string') return

    //string identifiers of the start/end of the table
    const tableStart = 'Total plays';
    const tableEnd = 'play means the track was played'

    //write a new .txt file with the raw data
    fs.writeFileSync(`./rawPages/bandcamp-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
        if (err) throw err;
    });

    //read in the data from the file that was written
    const rawContent = fs.readFileSync(`./rawPages/bandcamp-${username}.txt`, 'utf8');
    
    //create an array where each line is a new element
    let rawArray = rawContent.toString().split("\n");

    //remove the start of the page
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx + 3);

    //remove the end of the page
    let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    rawArray.splice(endIdx);

    /**trim the raw array down to an array containing strings for each track
     *          each string contains, track title, total streams, complete, partial, and skip stats
     * */
    let justTracks = [];
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
    //format the data for each song into an array of objects 
    for(let el of justTracks){
        let temp = el.split("\t").filter(Boolean);

        //create an object for the track entry
        let tempObject = { "title": temp[0], "plays": parseInt(temp[1]) || 0, "complete": parseInt(temp[2]) || 0, "partial": parseInt(temp[3]) || 0, "skip": parseInt(temp[4]) || 0}

        formattedData.push(tempObject);
    }
    console.log(formattedData)

    return formattedData
}

async function spotifyParser(rawData, username, range){

    //string identifiers of the start/end of the table
    const tableStart = range === "month" ? 'Last 28 days' : 'All time';
    const tableEnd = 'Spotify AB';

    //write a new .txt file for the raw data
    if(range === "month"){
        fs.writeFileSync(`./rawPages/spotify-month-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
            if (err) throw err;
        });
    } else if (range === "alltime") {
        fs.writeFileSync(`./rawPages/spotify-alltime-${username}.txt`, rawData, { 'encoding': 'utf8', 'flag': 'w' }, (err) => {
            if (err) throw err;
        });
    }
    

    //read in the data from the file that was written
    let rawContent;
    if (range === "month") {
        rawContent = fs.readFileSync(`./rawPages/spotify-month-${username}.txt`, 'utf8');
    } else if (range === "alltime") {
        rawContent = fs.readFileSync(`./rawPages/spotify-alltime-${username}.txt`, 'utf8');
    }
    
    //create an array where each line is a new element
    let rawArray = rawContent.toString().split("\n").filter(Boolean);

    //remove the start of the page
    let startIdx = rawArray.findIndex(line => line.includes(tableStart));
    rawArray.splice(0, startIdx - 1);

    //remove the end of the page
    let endIdx = rawArray.findIndex(line => line.includes(tableEnd));
    rawArray.splice(endIdx - 3);

    /**trim the raw array down to an array containing strings for each track
     *          each string contains, track title, total streams, complete, partial, and skip stats
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
    
    //format the data for each song into an array of objects 
    for (let el of justTracks) {
        let temp = el.split("\t").filter(Boolean);

        //create an object for the track entry
        let tempObject = { "title": temp[0], "streams": parseInt(temp[1]) || 0, "listeners": parseInt(temp[2]) || 0, "views": parseInt(temp[3]) || 0, "saves": parseInt(temp[4]) || 0 }

        formattedData.push(tempObject);
    }

    return formattedData
}

module.exports =  { distrokidParser, bandcampParser, spotifyParser }