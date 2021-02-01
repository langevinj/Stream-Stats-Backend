"use strict";

/**Tests for the Distrokid routes. */

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    distrokidTestData
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************POST /distrokid/import/:username */

describe("POST /distrokid/import/:username", function() {
    const data = { page: distrokidTestData }
    const badData = { page: "This isn't right at all \n Really it isn't."}

    test("ok for user", async function() {
        const resp = await request(app)
                    .post("/distrokid/import/u1")
                    .send(data)
                    .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ "response": "Distrokid"});
    });

    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/distrokid/import/u1")
            .send(data)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ "response": "Distrokid" });
    });

    test("unauth for other non-admin user", async function () {
        const resp = await request(app)
            .post("/distrokid/import/u1")
            .send(data)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with improper data", async function() {
        const resp = await request(app)
            .post("/distrokid/import/u1")
            .send(badData)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(400);
    });
});

/********************************GET /distrokid/:username */

describe("GET /distrokid/:username", function() {
    it("gets the data for a user", async function() {
        const resp = await request(app)
                         .get("/distrokid/u1")
                         .send({ "range": "alltime"})
                         .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ "response": [
            { "title": "song1", "store": "applemusic", "plays": "15", "profit": "0.0097586308"}
        ]})
    });

    it("works for admin", async function () {
        const resp = await request(app)
            .get("/distrokid/u1")
            .send({ "range": "alltime" })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            "response": [
                { "title": "song1", "store": "applemusic", "plays": "15", "profit": "0.0097586308" }
            ]
        })
    });

    it("unath for non-admin", async function() {
        const resp = await request(app)
            .get("/distrokid/u1")
            .send({ "range": "alltime" })
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
    });

    it("notfound if user doesn't exist", async function() {
        const resp = await request(app)
            .get("/distrokid/nope")
            .send({ "range": "alltime" })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(404);
    });
});
