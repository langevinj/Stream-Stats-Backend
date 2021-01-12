
/** Express app for stream-stats */

const express = require('express');
const cors = require('cors');

// const { NotFoundError } = require('./expressError');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const spotifyRoutes = require('./routes/spotify');
const bandcampRoutes = require('./routes/bandcamp');
const distrokidRoutes = require('./routes/distrokid');

const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/bandcamp", bandcampRoutes);
app.use("/distrokid", distrokidRoutes);

module.exports = app;