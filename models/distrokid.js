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
        fs.writeFile('distrokid.txt', page, 'utf8', (err) => {
            if(err) throw err;
            console.log('The file has been saved!');
        });
    }
}

module.exports = Distrokid;