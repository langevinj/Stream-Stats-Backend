"use strict"

/** Routes for Spotify for Artists */
const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const spotifyCredentialsSchema = require("../schemas/spotifyCredentials.json");
const spotifyLoginSchema = require("../schemas/spotifyLogin.json");
const Spotify = require("../models/spotify");
const { BadRequestError } = require("../expressError");

const router = express.Router();

/** POST /saveCredentials
 *      {username, password}
 * Save a users username and password for Spotify for artists
 */

 /**Currently not in use! */

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
 *      Crawls Spotify for Artists webpage and saves data to DB.
 */

 router.post("/gatherData/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
     try {
        const validator = jsonschema.validate(req.body, spotifyLoginSchema);
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);

            //Make errors user friendly to view.
            function makeCustomErrors(error){
                if (error.includes("instance.email")) return "You didn't enter a valid email";
                if (error.includes("instance.password")) return "You didn't enter a valid password";
            }

            const customErrs = errs.map(e => makeCustomErrors(e));
            throw new BadRequestError(customErrs);
        }

         const response = await Spotify.crawlAndSave(req.body.email, req.body.password, req.params.username);
         return res.json({ response });
     } catch (err) {
         console.log(err)
         return next(err);
     }
});

/** POST /import/:username
 * {page, range} => {response}
 *          Take a raw page from the user, parse it and save it to the DB.
 * 
 * 
 * Authorization required: admin or correct user
 */
router.post("/import/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = await Spotify.processRawImport(req.body, req.params.username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

/**GET /:username { range } =>
 *      Get spotify data for user with username.
 *
 * Authorization required: correct user or admin
 */

 router.get("/:username/:range", ensureCorrectUserOrAdmin, async function (req, res, next) {
     try {
         const response = await Spotify.getUserSpotifyData(req.params.range, req.params.username);
         return res.status(200).json({ response: response });
     } catch (err) {
         return next(err);
     }
 });


module.exports = router;