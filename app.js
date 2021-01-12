
/** Express app for stream-stats */

const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const spotifyRoutes = require('./routes/spotify');
const bandcampRoutes = require('./routes/bandcamp');
const distrokidRoutes = require('./routes/distrokid');

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/bandcamp", bandcampRoutes);
app.use("/distrokid", distrokidRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;