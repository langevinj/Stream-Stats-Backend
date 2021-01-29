"use strict";

/**Tests for the bandcamp routes. */

const request = require("supertest");

const app = require("../app");
const { UnauthorizedError } = require("../expressError");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    bandcampMonthTestData
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************** POST /bandcamp/import/:username*/

describe("POST /import/:username", function() {
    const data = { page: bandcampMonthTestData, range: "month"};
    const badData = { page: "This isn't right\n Not at all", range: "month"}

    test("imports for user", async function(){
        const resp = await request(app)
            .post("/bandcamp/import/u1")
            .send(data)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({"response": "Bandcamp 30 days"});
    });

    test("imports for admin", async function(){
        const resp = await request(app)
            .post("/bandcamp/import/u1")
            .send(data)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({ "response": "Bandcamp 30 days" });
    });

    test("unauth for non-user non-admin", async function(){
        try {
            const resp = await request(app)
                .post("/bandcamp/import/u1")
                .send(data)
                .set("authorization", `Bearer ${u2Token}`);
        } catch (err) {
            expect(err instanceof UnauthorizedError);
        }
    });

    test("unath for invalid data", async function() {
        try {
            const resp = await request(app)
                .post("/bandcamp/import/u1")
                .send(badData)
                .set("authorization", `Bearer ${u1Token}`);
        } catch (err) {
            expect(err instanceof BadRequestError);
        }    
    });
});

/**************************GET /bandcamp/:username/:range */

describe("GET /bandcamp/:username/:range", function(){
    test("ok for correct user", async function() {
        const resp = await request(app)
                    .get("/bandcamp/u1/month")
                    .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"response": [
            {"title": "song2","plays": 25,"complete":  0, "partial": 0, "skip": 0},
            { "title": "song1", "plays": 15, "complete":  0, "partial": 0, "skip": 0}
        ]});
    });

    test("ok for admin", async function () {
        const resp = await request(app)
            .get("/bandcamp/u1/month")
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            "response": [
                { "title": "song2", "plays": 25, "complete": 0, "partial": 0, "skip": 0 },
                { "title": "song1", "plays": 15, "complete": 0, "partial": 0, "skip": 0 }
            ]
        });
    });

    test("unauth if incorrect user", async function() {
        try{
            const resp = await request(app)
                        .get("/bandcamp/u1/month")
                        .set("authorization", `Bearer ${u2Token}`);
        } catch (err) {
            expect(err instanceof UnauthorizedError);
        }
    });
});

