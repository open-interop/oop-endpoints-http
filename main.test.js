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
                            deviceTemprId: 1,
                            rendered: {
                                host: "example.com",
                                port: "",
                                path: "/",
                                requestMethod: "GET",
                                headers: {},
                                body: "",
                                protocol: "http"
                            }
                        }
                    },
                    ack: () => {},
                    nack: () => {}
                });
            },
            publish: (exchange, queue, message) => {
                t.is(message.retries, undefined);
                t.is(message.tempr.response.body, "Hello, World!");
                t.is(message.tempr.response.headers["content-length"], "13");
                t.is(message.tempr.response.status, 200);

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

test("request posts to error queue", async t => {
    t.plan(1);

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
                            deviceTemprId: 1,
                            queueRequest: true,
                            queueResponse: true,
                            rendered: {
                                host: "other.com",
                                port: "",
                                path: "/",
                                requestMethod: "GET",
                                headers: {},
                                body: "",
                                protocol: "http"
                            }
                        }
                    },
                    ack: () => {},
                    nack: () => {}
                });
            },
            publish: (exchange, queue, response) => {
                t.is(response.tempr.response.success, false);

                resolve();
            }
        };

        main(
            broker,
            {
                exchangeName: "error.exchange",
                httpOutputQ: "error.q",
                maxRetryAttempts: 2
            },
            mockConsole
        );
    });

    await p;
});

test("Missing tempr doesn't crash", async t => {
    const p = new Promise((resolve, reject) => {
        const broker = {
            create: () => {},
            consume: async (queue, callback) => {
                await callback({
                    content: {
                        uuid: "000000-0000-0000-000000",
                        transmissionId: 1,
                        device: {
                            id: 1
                        },
                        message: {
                            body: "test"
                        }
                    },
                    ack: () => {},
                    nack: () => {}
                });

                resolve();
                t.pass();
            },
            publish: (exchange, queue, response) => {
                reject(new Error("This test should not publish"));
            }
        };

        main(
            broker,
            {
                exchangeName: "error.exchange",
                httpOutputQ: "error.q",
                maxRetryAttempts: 2
            },
            mockConsole
        );
    });

    await p;
});
