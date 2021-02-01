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
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************POST /spotify/import/:username */

describe("POST /spotify/import/:username", function() {
    const data = { page: , range: "month"};

    
});