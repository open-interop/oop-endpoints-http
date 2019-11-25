import test from "ava";

const mock = require("mock-require");
const fetchMock = require("fetch-mock");

const sandbox = fetchMock.sandbox();

sandbox.mock("http://example.com", { body: "Hello, World!" });
sandbox.catch(async () => {
    throw new Error("Something went wrong.");
});

mock("node-fetch", sandbox);

const main = require("./main");

const mockConsole = { info: () => {}, log: () => {}, error: () => {} };

test("request works", async t => {
    t.plan(4);

    const p = new Promise(resolve => {
        const broker = {
            create: () => {},
            consume: (queue, callback) => {
                callback({
                    content: {
                        uuid: "000000-0000-0000-000000",
                        transmissionId: 1,
                        device: {
                            id: 1
                        },
                        message: {
                            body: "test"
                        },
                        tempr: {
                            deviceTemprId: 1
                            rendered: {
                                host: "example.com",
                                port: "",
                                path: "/",
                                requestMethod: "GET",
                                headers: {},
                                body: "",
                                protocol: "http"
                            },
                        },
                    },
                    ack: () => {},
                    nack: () => {}
                });
            },
            publish: (exchange, queue, message) => {
                t.is(message.retries, undefined);
                t.is(message.response.body, "Hello, World!");
                t.is(message.response.headers["content-length"], "13");
                t.is(message.response.status, 200);

                resolve();
            }
        };

        main(
            broker,
            {
                maxRetryAttempts: 0,
                errorQ: "error.q",
                coreResponseQ: "correct.q"
            },
            mockConsole
        );
    });

    await p;
});

test("request retries then posts to error queue", async t => {
    t.plan(3);

    const p = new Promise(resolve => {
        const broker = {
            create: () => {},
            consume: (queue, callback) => {
                broker.callback = callback;
                callback({
                    content: {
                        uuid: "000000-0000-0000-000000",
                        transmissionId: 1,
                        device: {
                            id: 1
                        },
                        message: {
                            body: "test"
                        },
                        tempr: {
                            deviceTemprId: 1,
                            queueRequest: true,
                            queueResponse: true
                        },
                        rendered: {
                            host: "other.com",
                            port: "",
                            path: "/",
                            requestMethod: "GET",
                            headers: {},
                            body: "",
                            protocol: "http"
                        }
                    },
                    ack: () => {},
                    nack: () => {}
                });
            },
            publish: (exchange, queue, response) => {
                broker.publish = (exchange, queue, response) => {
                    t.is(exchange, "error.exchange");
                    t.is(queue, "error.q");
                    t.is(response.retries, 2);

                    resolve();
                };

                broker.callback({ content: response });
            }
        };

        main(
            broker,
            {
                errorExchangeName: "error.exchange",
                errorQ: "error.q",
                maxRetryAttempts: 2
            },
            mockConsole
        );
    });

    await p;
});
