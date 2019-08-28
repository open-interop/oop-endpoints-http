const amqp = require("amqplib");
const config = require("./config");
const { logger } = require("./logger");
const mustache = require("mustache");
const fetch = require("node-fetch");

var previousRequest = Promise.resolve();

const sleep = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

amqp.connect(config.amqpAddress)
    .then(conn => {
        return conn.createChannel().then(async ch => {
            await ch.assertQueue(`${config.oopEndpointsQ}.http`);
            await ch.bindQueue(
                `${config.oopEndpointsQ}.http`,
                config.endpointsExchangeName,
                `${config.oopEndpointsQ}.http`
            );

            return ch.consume(`${config.oopEndpointsQ}.http`, message => {
                var data = JSON.parse(message.content.toString("utf8"));
                logger.info(`Processing ${data.uuid}.`);

                var {
                    host,
                    port,
                    path,
                    requestMethod,
                    headers,
                    body,
                    protocol
                } = data.tempr.template;

                var render = val => {
                    if (typeof val === "undefined") {
                        return "";
                    }

                    return mustache.render(String(val), data);
                };
                var map = array => {
                    var ret = {};

                    for (const obj of array) {
                        for (const key in obj) {
                            ret[key] = render(obj[key]);
                        }
                    }

                    return ret;
                };

                var url =
                    render(protocol) +
                    "://" +
                    render(host) +
                    render(port ? ":" + port : "") +
                    render(path);

                var options = {
                    headers: map(headers),
                    method: render(requestMethod)
                };

                const renderedBody = render(body);

                if (!options.method) {
                    if (renderedBody) {
                        options.method = "POST";
                    } else {
                        options.method = "GET";
                    }
                }

                if (options.method.toUpperCase() !== "GET") {
                    options.body = renderedBody;
                }

                previousRequest = previousRequest.then(() => {
                    return fetch(url, options)
                        .then(async res => {
                            logger.info(`Sent message ${data.uuid}`);

                            const responseData = {
                                success: res.status === 200,
                                status: res.status,
                                datetime: new Date(),
                                messageId: data.uuid,
                                deviceId: data.device.id,
                                deviceTemprId: data.tempr.deviceTemprId
                            };

                            if (data.tempr.queueResponse) {
                                responseData.body = await res.text();
                            }

                            ch.sendToQueue(
                                config.coreResponseQ,
                                Buffer.from(JSON.stringify(responseData))
                            );

                            ch.ack(message);
                        })
                        .catch(() => {
                            logger.error(`Unknown error occured ${data.uuid}`);

                            ch.nack(message);
                        })
                        .then(() => {
                            return sleep(config.requestTimeout);
                        });
                });
            });
        });
    })
    .catch(err => {
        logger.error(String(err));
        console.log(err);
    });
