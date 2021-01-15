"use strict"

/** Routes for Spotify for Artists */
const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const spotifyCredentialsSchema = require("../schemas/spotifyCredentialsSchema.json");
const Spotify = require("../models/distrokid");

const router = express.Router();

/** POST /saveCredentials
 *      {username, password}
 * save a users username and password for Spotify for artists
 */

router.post("/saveCredentials", async function (req, res, next) {
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

module.exports = router;