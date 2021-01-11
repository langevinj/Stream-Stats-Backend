const app = require("./app");
const { PORT } = require("./config.js");

app.listen(PORT, function () {
    console.log(`Started on http://localhost:${PORT}`);
});