import catMiddleware from "../src/index.js";

import { test } from "node:test";
import { once } from "node:events";

import assert from "node:assert/strict";

import express from "express";


/**
 * Starts a test server with the given test function.
 * @param {test.TestFn} testFunc 
 * @returns {Promise<string>} The URL of the test server
 */
const start = async (testFunc) => {
    const app = express();
    app.use(catMiddleware);
    app.get("/status/:code", (req, res) => res.status(+req.params.code).send("custom"));

    const server = app.listen(0);
    testFunc.after(() => server.close());

    await once(server, "listening");
    return `http://localhost:${server.address().port}`;
};

const html = { headers: { accept: "text/html" } };

for (const code of [400, 403, 404, 418, 500, 503]) {
    test(`${code} gets the cat`, async (t) => {
        const result = await fetch(`${await start(t)}/status/${code}`, html);
        assert.equal(result.status, code);
        assert.match(await result.text(), new RegExp(`http\\.cat/${code}\\.jpg`));
    });
}

for (const code of [200, 201, 302, 499]) {
    test(`${code} is untouched`, async (t) => {
        const result = await fetch(`${await start(t)}/status/${code}`, { ...html, redirect: "manual" });
        assert.equal(await result.text(), "custom");
    });
}

test("JSON clients are left alone", async (t) => {
    const result = await fetch(`${await start(t)}/status/500`, { headers: { accept: "application/json" } });
    assert.equal(await result.text(), "custom");
});