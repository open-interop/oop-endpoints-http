const DEFAULT_CONTENT_TYPE = "application/json";

const serialize = (body, headers) => {
    if (typeof body === "string") {
        return body;
    }

    const contentType = getContentType(headers);

    if (/\bjson\b/.exec(contentType)) {
        return JSON.stringify(body);
    } else if (/x-www-form-urlencoded/.exec(contentType)) {
        return urlencode(body);
    }

    return JSON.stringify(body);
};

const getContentType = headers => {
    for (const key in headers) {
        if (key.trim().toLowerCase() === "content-type") {
            return headers[key].trim().toLowerCase();
        }
    }

    return DEFAULT_CONTENT_TYPE;
};

const urlencode = content => {
    if (typeof content === "string") {
        return encodeURIComponent(content);
    } else {
        const parts = [];

        for (const key in content) {
            parts.push(
                encodeURIComponent(key) + "=" + encodeURIComponent(content[key])
            );
        }

        return parts.join("&");
    }
};

module.exports = serialize;
