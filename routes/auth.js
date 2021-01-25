"use strict";

/** Routes for auth*/

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json")
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);

            function makeCustomErrors(error) {
                if (error.includes("instance.email")) return "You didn't enter a valid email";
                
                if (error.includes("instance.password")){
                    if(error.includes("maximum")) return "The password you entered is too long";
                    if(error.includes("minimum")) return "The password you entered is too short";
                    return "Invalid password"
                } 

                if(error.includes("username")){
                    if (error.includes("maximum")) return "The username you entered is too long";
                    if (error.includes("minimum")) return "The username you entered is too short";
                    return "Invalid username"
                }
            }

            const customErrs = errs.map(e => makeCustomErrors(e));
            throw new BadRequestError(customErrs);
        }

        const newUser = await User.register({ ...req.body, isAdmin: false });
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;