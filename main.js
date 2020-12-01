const fetch = require("node-fetch");

const serialize = require("./serializer");

var previousRequest = Promise.resolve();

const sleep = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

module.exports = async (broker, config, logger) => {
    const queue = `${config.oopEndpointsQ}.http`;

    return broker.consume(queue, async message => {
        var data = message.content;

        logger.info(`Processing ${data.uuid}.`);

        if (!(data.tempr && data.tempr.rendered)) {
            logger.error(`No tempr associated with ${data.uuid}. Discarding.`);

            return;
        }

        try {
            var {
                host,
                port,
                path,
                requestMethod,
                headers,
                body,
                protocol
            } = data.tempr.rendered;
        } catch (e) {
            logger.error(e);
            return previousRequest;
        }

        host = host.replace(/\s/g, "");
        port = port ? parseInt(port) : "";
        protocol = protocol.toLowerCase();

        if (!/https?/.test(protocol)) {
            data.retries = config.maxRetryAttempts;
            throw new Error(
                `"${protocol} is not a valid protocol, please specify either http or https.`
            );
        }

        var url = protocol + "://" + host + (port ? ":" + port : "") + path;

        var options = {
            headers: headers,
            method: requestMethod
        };

        if (!options.method) {
            if (body) {
                options.method = "POST";
            } else {
                options.method = "GET";
            }
        }

        if (options.method.toUpperCase() !== "GET") {
            options.body = serialize(body, headers);
        }

        previousRequest = previousRequest.then(() => {
            return fetch(url, options)
                .then(async res => {
                    logger.info(`Sent message ${data.uuid}`);

                    data.tempr.response = {
                        datetime: new Date(),
                        success: res.status >= 200 && res.status < 300,
                        body: await res.text(),
                        status: res.status,
                        headers: (() => {
                            const headers = {};
                            for (const [key, value] of res.headers) {
                                headers[key] = value;
                            }
                            return headers;
                        })(),
                        error: null
                    };

                    broker.publish(
                        config.exchangeName,
                        config.httpOutputQ,
                        data
                    );
                })
                .catch(err => {
                    logger.error(err);

                    data.tempr.response = {
                        datetime: new Date(),
                        success: false,
                        body: null,
                        status: null,
                        headers: null,
                        error: err
                    };

                    broker.publish(
                        config.exchangeName,
                        config.httpOutputQ,
                        data
                    );
                })
                .then(() => {
                    return sleep(config.requestTimeout);
                });
        });

        return previousRequest;
    });
};
