const WHITELISTED_CODES = new Set([
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
    415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500,
    501, 502, 503, 504, 506, 507, 508, 510, 511,
]);

function generatePageContents(code) {
    return Buffer.from(
        `<doctype html>` +
        `<html lang="en">` +
        `<head>` +
            `<meta charset="utf-8">` +
            `<meta name="viewport" content="width=device-width, initial-scale=1">` +
            `<title>HTTP ${code}</title>` +
        `</head>` +   
        `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000">` +
            `<img src="https://http.cat/${code}.jpg" alt="HTTP ${code}" style="max-width:100%;max-height:100vh">` +
        `</body>`
    );
}

/**
 * @description Express middleware that replaces the response body with a cat image for certain HTTP status codes if the
 *              client accepts HTML.
 * @param {import("express").Request     } request  The request object.
 * @param {import("express").Response    } response The response object.
 * @param {import("express").NextFunction} next     The next middleware function.
 */
export default function catMiddleware(request, response, next) {
    const end = response.end;
    response.end = function (...args) {
        const statusCode = response.statusCode;
        if (!WHITELISTED_CODES.has(statusCode)) {
            return end.apply(this, args);
        }

        if (response.headersSent || request.accepts(["json", "html"]) !== "html") {
            return end.apply(this, args);
        }

        const body = generatePageContents(statusCode);
        response.removeHeader("ETag");
        response.setHeader("Content-Security-Policy", "default-src 'none'; img-src https://http.cat; style-src 'unsafe-inline'");
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.setHeader("Content-Length", body.length);

        return end.call(this, body);
    };

    next();
};