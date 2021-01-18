"use strict";

/** Routes for Bandcamp*/
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const Bandcamp = require("../models/bandcamp");
const { decodeToken } = require("../helpers/tokens");

const router = express.Router();

/** POST /rawImport { page } => { response }
 *          take raw page data from the user, parse and save data to the DB
 *
 * Authorization required: logged in
  */

router.post("/rawImport", ensureLoggedIn, async function (req, res, next) {
    try {
        const response = await Bandcamp.processRawImport(req.body.page, decodeToken(req).username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;