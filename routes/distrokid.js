"use strict"

/** Routes for Distrokid*/

const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Distrokid = require("../models/distrokid");

const router = express.Router();

/** POST /rawImport { page } => { response }
 *          take raw page data from the user, parse and save data to the DB
 * 
 * Authorization required: logged in
  */
 
router.post("/rawImport/:username", ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const response = await Distrokid.processRawImport(req.body.page, req.params.username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;