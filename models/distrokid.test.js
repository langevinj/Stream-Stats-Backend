"use strict"

/** Run tests like 'jest distrokid.test.js'
 *      Test suit for the Distrokid model.
 */

const { NotFoundError } = require('../expressError');
const Distrokid = require("./distrokid.js");
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

/*************************getUserDistrokidData */

describe("getUserDistrokidData", function() {
    test("works", async function() {
        let data = await Distrokid.getUserDistrokidData('u1');
        expect(data).toEqual([
            { "title": 'song1', "store": 'applemusic', "plays": "15", "profit": "0.0097586308"}
        ]);
    });

    test("throws NotFoundError if the user doesn't have data", async function() {
        try {
            let data = await Distrokid.getUserDistrokidData('u2');
        } catch (err) {
            expect(err instanceof NotFoundError);
        }
    });
});