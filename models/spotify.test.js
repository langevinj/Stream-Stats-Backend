"use strict"

/** Run tests like 'jest spotify.test.js'
 *      Test suit for the Spotify model.
 */

const db = require("../db");
const { NotFoundError, BadRequestError } = require('../expressError');
const Spotify = require("./spotify.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);