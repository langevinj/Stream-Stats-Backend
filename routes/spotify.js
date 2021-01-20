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

/** POST /import/:username
 * {page, range} => {response}
 *          take a raw page from the user, parse and save it to the DB
 * 
 * 
 * Authorization required: admin or correct user
 */
router.post("/import/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = Spotify.processRawImport(req.body, req.params.username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

/**GET /:username { range } =>
 *      get spotify data for user with username
 *
 * Authorization required: correct user or admin
 */

 router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
     try {
         const response = await Spotify.getUserSpotifyData(req.body.range, req.params.username);
         console.log(response)
         return res.status(200).json({ response: response });
     } catch (err) {
         return next(err);
     }
 });



module.exports = router;