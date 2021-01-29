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

/******************** POST /import/:username*/

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

