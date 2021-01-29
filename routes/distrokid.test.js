"use strict";

/**Tests for the Distrokid routes. */

const request = require("supertest");

const app = require("../app");
const { UnauthorizedError, BadRequestError } = require("../expressError");

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
        try {
            const resp = await request(app)
                .post("/distrokid/import/u1")
                .send(data)
                .set("authorization", `Bearer ${u2Token}`);
        } catch (err) {
            expect(err instanceof UnauthorizedError)
        }
    });

    test("bad request with improper data", async function() {
        try {
            const resp = await request(app)
                .post("/distrokid/import/u1")
                .send(badData)
                .set("authorization", `Bearer ${u1Token}`);
        } catch (err) {
            expect(err instanceof BadRequestError);
            expect(err.message).toEqual("The distrokid data you provided was incorrectly formatted. Please try copy and pasting again.");
        }
    });
});
