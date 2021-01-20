"use strict";
/** Routes for Bandcamp*/
const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Bandcamp = require("../models/bandcamp");

const router = express.Router();


/** POST /import {page} => 
 *      take a raw page of data from the user, parse, and save it to the DB
 * 
 * Authorization required: correct user or admin
 */

router.post("/import/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = await Bandcamp.processRawImport(req.body, req.params.username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

/**GET /:username { range } => {[title, plays, complete, partial, skip], ...}
 *      get bandcamp data for user with username
 * 
 * Authorization required: correct user or admin
 */

 router.get("/:username", ensureCorrectUserOrAdmin, async function(req, res, next){
     try {
         const response = await Bandcamp.getUserBandcampData(req.body.range, req.params.username);
         return res.status(200).json({response : response })
     } catch (err) {
         return next(err);
     }
 });




module.exports = router;