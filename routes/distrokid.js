"use strict"

/** Routes for Distrokid*/
const jsonschema = require("jsonschema");

const express = require("express");
const Distrokid = require("../models/distrokid");

const router = express.Router();

/** POST /rawImport { page } => { response }
 *          take raw page data from the user, parse and save it
  */
 
router.post("/rawImport", async function(req, res, next) {
    try {
        const response = await Distrokid.processRawImport(req.body);
        return res.status(201).json({ response });

    } catch (err) {
        return next(err);
    }
});

module.exports = router;