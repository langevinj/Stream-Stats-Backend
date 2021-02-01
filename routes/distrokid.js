"use strict"

/** Routes for Distrokid*/

const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Distrokid = require("../models/distrokid");

const router = express.Router();

/** POST /import/:username { page } => { response }
 *          Take raw page data from the user, parse it and save data to the DB.
 * 
 * Authorization required: correct user or admin
  */
 
router.post("/import/:username", ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const response = await Distrokid.processRawImport(req.body.page, req.params.username);
        return res.status(201).json({ response });
    } catch (err) {
        return next(err);
    }
});

/**GET /:username { range } => 
 *      Get distrokid data for user with username.
 * 
 * Authorization required: correct user or admin
 */

router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const response = await Distrokid.getUserDistrokidData(req.params.username, req.body.range);
        return res.status(200).json({ response: response });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;