require("dotenv").config();
const express = require("express");
const pkg = require("./package.json");

const PORT = process.env.PORT;
const app = express();

// Load bot
const jared = require("./jared")

app.use(jared)

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/say", (req, res) => {
	res.sendFile('say.html');
});

app.listen(PORT, () => {
	console.log(`Jared Bot version ${pkg.version} running on port ${PORT}!`);
});