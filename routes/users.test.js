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
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**********************************POST /users */

describe("POST /users", function() {
    const data = {
        "username": "testuser",
        "password": "password",
        "email": "testemail@email.com",
        "bandName": "testband",
        "isAdmin": false
    }

    const missingData = {
        "username": "testuser",
        "email": "testemail@email.com",
        "bandName": "testband",
        "isAdmin": false 
    }

    const badData = {
        "username": "testuser",
        "password": 1234,
        "email": "testemailemail.com",
        "bandName": "testband",
        "isAdmin": false
    }

    test("allows an admin to add a user", async function() {
        const resp = await request(app)
                   .post("/users")
                   .send(data)
                   .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "user": {
                "username": "testuser",
                "email": "testemail@email.com",
                "bandName": "testband",
                "isAdmin": false
            }, "token": expect.any(String)
        }); 
    });

    test("allows an admin to add a user who is an admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({...data, isAdmin: true})
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "user": {
                "username": "testuser",
                "email": "testemail@email.com",
                "bandName": "testband",
                "isAdmin": true
            }, "token": expect.any(String)
        });
    });

    test("bad request with missing data", async function() {
        const resp = await request(app)
            .post("/users")
            .send(missingData)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(400);
    });

    test("bad request with invalid data", async function() {
        const resp = await request(app)
            .post("/users")
            .send(badData)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(400);
    });
});