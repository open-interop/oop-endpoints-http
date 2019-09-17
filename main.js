const fetch = require("node-fetch");

const renderer = require("./lib/renderer");

var previousRequest = Promise.resolve();

const sleep = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

module.exports = async (broker, config, logger) => {
    let queue = `${config.oopEndpointsQ}.http`;

    await broker.create(queue, config.endpointsExchangeName, {autoDelete: true})

    return broker.consume(queue, async message => {
        var data = message.content;

        logger.info(`Rendering ${data.uuid}.`);

        try {
            var {
                host,
                port,
                path,
                requestMethod,
                headers,
                body,
                protocol
            } = await renderer(data, data.tempr.template);
        } catch (e) {
            logger.error(e);
            return previousRequest;
        }

        var url =
            protocol +
            "://" +
            host +
            (port ? ":" + port : "") +
            path;

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
            options.body = body;
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

                    broker.publish(
                        config.exchangeName,
                        config.coreResponseQ,
                        responseData
                    );

                    message.ack();
                })
                .catch(err => {
                    console.error(err);

                    message.nack();
                })
                .then(() => {
                    return sleep(config.requestTimeout);
                });
        });

        return previousRequest;
    });
};
