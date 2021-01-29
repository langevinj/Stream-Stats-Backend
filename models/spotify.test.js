"use strict"

/** Run tests like 'jest spotify.test.js'
 *      Test suit for the Spotify model.
 */

const { NotFoundError } = require('../expressError');
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

/*******************getUserSpotifyData */

describe("getUserSpotifyData", function() {
    test("works with alltime data", async function() {
        let data = await Spotify.getUserSpotifyData('alltime', 'u1');
        expect(data).toEqual([
            {"title": 'song2', "streams": 2000, "listeners": 0},
            { "title": 'song1', "streams": 1400, "listeners": 0},
            {"title": 'song3', "streams": 50, "listeners": 0}
        ]);
    });

    test("works with monthly data", async function () {
        let data = await Spotify.getUserSpotifyData('month', 'u1');
        expect(data).toEqual([
            { "title": 'song2', "streams": 300, "listeners": 0 },
            { "title": 'song1', "streams": 200, "listeners": 0 },
            { "title": 'song3', "streams": 50, "listeners": 0 }
        ]);
    });

    test("throws NotFoundError if invalid user", async function() {
        try {
            let data = await Spotify.getUserSpotifyData('alltime', 'u3');
        } catch (err) {
            expect(err instanceof NotFoundError);
        }
    });
});
