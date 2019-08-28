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
            console.log("here");
            await ch.assertQueue(`${config.oopEndpointsQ}.http`);
            console.log(
                `${config.oopEndpointsQ}.http`,
                config.endpointsExchangeName,
                `${config.oopEndpointsQ}.http`
            );
            await ch.bindQueue(
                `${config.oopEndpointsQ}.http`,
                config.endpointsExchangeName,
                `${config.oopEndpointsQ}.http`
            );

            return ch.consume(`${config.oopEndpointsQ}.http`, message => {
                var data = JSON.parse(message.content.toString("utf8"));
                console.log(mustache.render(data.tempr.template.body, data));

                var {
                    host,
                    port,
                    path,
                    request_method,
                    headers,
                    body,
                    protocol
                } = data.tempr.template;

                var render = val => mustache.render(String(val), data);
                var map = obj => {
                    var ret = {};

                    for (const key in obj) {
                        ret[key] = render(obj[key]);
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
                    method: render(request_method)
                };

                if (request_method.toUpperCase() !== "GET") {
                    options.body = render(body);
                }

                previousRequest = previousRequest.then(() => {
                    return fetch(url, options)
                        .then(() => {
                            logger.info(`Sent message ${data.uuid}`);
                            ch.ack(message);
                        })
                        .catch(() => {
                            logger.error(`Unable to send message ${data.uuid}`);
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
