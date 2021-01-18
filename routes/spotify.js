"use strict"

/** Routes for Spotify for Artists */
const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const spotifyCredentialsSchema = require("../schemas/spotifyCredentials.json");
const Spotify = require("../models/spotify");

const router = express.Router();

/** POST /saveCredentials
 *      {username, password}
 * save a users username and password for Spotify for artists
 */

router.post("/saveCredentials", ensureLoggedIn, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, spotifyCredentialsSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const response = Spotify.saveUserCredentials(req.body);
        return res.json({ response })
    } catch (err) {
        return next(err);
    }
});

/** POST /gatherData
 *  {username}
 *      crawls Spotify for artists webpage and saves data to DB
 */

 router.post("/gatherData/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
     try {
         const response = Spotify.crawlAndSave(req.body.email, req.body.password, req.params.username);
         return res.json({ response });
     } catch (err) {
         return next(err);
     }
});

/** POST /rawMonthImport
 * {page, username} => { respose }
 *          take raw page data from the user, parse and save it to the DB
 * 
 * Authorization required: loggedin
 */

 router.post("/rawMonthImport/:username", ensureLoggedIn, async function(req, res, next){
     try {
         const response = Spotify.processRawMonthImport(req.body.page, req.params.username);
         return res.json({ response });
     } catch (err) {
         return next(err);
     }
 });


/** POST /rawAlltimeImport
* {page, username} => { respose }
*          take raw page data from the user, parse and save it to the DB
* 
* Authorization required: loggedin
*/

router.post("/rawAlltimeImport/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = Spotify.processRawAlltimeImport(req.body.page, req.params.username);
        return res.json({ response });
    } catch (err) {
        return next(err);
    }
});

 


module.exports = router;