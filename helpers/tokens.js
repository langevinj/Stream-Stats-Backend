const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Return signed JWT from user data. */

function createToken(user) {
    console.assert(user.isAdmin !== undefined,
            "createToken passed user without isAdmin property");

    let payload = {
        username: user.username,
        isAdmin: user.isAdmin || false,
    };

    return jwt.sign(payload, SECRET_KEY);
}

function decodeToken(req) {
    const authHeader = req.headers && req.headers.authorization
    const token = authHeader.replace(/^[Bb]earer /, "").trim();
    const username = jwt.decode(token);
    return username;
}

module.exports = { createToken, decodeToken };