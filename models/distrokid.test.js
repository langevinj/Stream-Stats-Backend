"use strict"

const db = require("../db");
const { NotFoundError, BadRequestError } = require('../expressError');
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