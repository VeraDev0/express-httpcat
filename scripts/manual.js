import express from "express";

import catMiddleware from "../src/index.js";

const CODES = [200, 302, 400, 401, 403, 404, 418, 429, 500, 502, 503, 499];

const app = express();
app.use(catMiddleware);

app.get("/", (req, res) => {
    const links = CODES.map((c) => `<li><a href="/status/${c}">${c}</a></li>`);
    res.send(`<ul>${links.join("")}</ul><a href="/does-not-exist">unmatched route</a>`);
});

app.get("/status/:code", (req, res) => {
    res.status(+req.params.code).send(`custom body for ${req.params.code}`);
});

const server = app.listen(3000, () => console.log("http://localhost:3000"));
process.on("SIGINT", () => server.close());