"use strict";

/** Routes for Bandcamp*/
const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Bandcamp = require("../models/bandcamp");

const router = express.Router();

/** POST /rawAlltimeImport { page } => { response }
 *          take raw page data from the user, parse and save data to the DB
 *
 * Authorization required: correct user or admin
  */

router.post("/rawAlltimeImport/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = await Bandcamp.processRawImport(req.body.page, req.params.username, "alltime");
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

/** POST /rawMonthImport { page } => { response }
 *          take raw page data for a month from the user, parse and save data to the DB
 *
 * Authorization required: correct user or admin
  */

router.post("/rawMonthImport/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = await Bandcamp.processRawImport(req.body.page, req.params.username, "month");
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});




module.exports = router;