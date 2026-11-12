# express-httpcat

Express middleware that replaces error responses with a [http.cat](https://http.cat) image.

## Install

```bash
npm i express-httpcat
```

Requires Node.js 20+ and Express 4 or 5.

## Usage

Mount it **before** your routes:

```js
import express from "express";
import catMiddleware from "express-httpcat";

const app = express();
app.use(catMiddleware);

app.get("/", (req, res) => res.send("hello"));

app.listen(3000);
```

Every unmatched route (404) and every `res.status(5xx).send(...)` now shows a cat in the browser.

## Behavior

The response body is replaced only when **all** of these are true:

- The status code is one of the 4xx/5xx codes http.cat has an image for.
- The client prefers HTML over JSON (`Accept: text/html`, i.e. browsers).
- Headers have not been sent yet.

Everything else passes through untouched, so API clients (`Accept: application/json` or `*/*`) still get your real error bodies.

The replaced response sets its own `Content-Security-Policy` allowing images from `https://http.cat` only.

## Development

```bash
npm test      # run tests
npm run dev   # open http://localhost:3000 and click through the codes
```

## License

MPL-2.0 license. See [LICENSE](LICENSE) for details.