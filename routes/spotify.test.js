"use strict";

/**Tests for the Spotify routes. */

const request = require("supertest");

const app = require("../app");
const { UnauthorizedError, BadRequestError, NotFoundError } = require("../expressError");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    spotifyTestData
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************POST /spotify/import/:username */

describe("POST /spotify/import/:username", function() {
    const data = { page: spotifyTestData, range: "month"};
    const badData = { page: "This isn't right at all \n Really it isn't.", range: "alltime" };

    test("ok for user", async function() {
        const resp = await request(app)
                    .post("/spotify/import/u1")
                    .send(data)
                    .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ "response": "Spotify 28 days"})
    });


});