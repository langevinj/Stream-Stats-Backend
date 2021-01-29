"use strict"

const db = require("../db");
const { NotFoundError, BadRequestError } = require('../expressError');
const Bandcamp = require("./bandcamp.js");
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

/*********************** getUserBandcampData */

describe("getUserBandcampData", function() {
    test("works for all time data", async function() {
        let data = await Bandcamp.getUserBandcampData('u1');
        expect(data).toEqual([
            { "title": 'song2', "plays": 200, "complete": 0, "partial": 0, "skip": 0 },
            {"title": 'song1', "plays": 100, "complete": 0, "partial": 0, "skip": 0}
        ]);
    });

    test("works for month data", async function () {
        let data = await Bandcamp.getUserBandcampData('u2', "month");
        expect(data).toEqual([
            { "title": 'song3', "plays": 55, "complete": 0, "partial": 0, "skip": 0 }
        ]);
    });

    test("it throws a NotFoundError if the user doesn't exist", async function() {
        try {
            await Bandcamp.getUserBandcampData("u3");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
