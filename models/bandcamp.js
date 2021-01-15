"use strict";

const db = require("../db");
const fs = require("fs");

const { bandcampParser } = require('../helpers/parsers');

/** Functions for bandcamp. */

class Bandcamp {

    //parse the raw data from the user
    static async processRawImport({ page, username }) {

        /**call helper function to format all the data
         *      returns array of objects containing each dataset
        */
        let formattedArray = await bandcampParser(page, username);
        console.log(formattedArray);
    }
}


module.exports = Bandcamp;