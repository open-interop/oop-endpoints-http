import test from "ava";

const mock = require("mock-require");
const fetchMock = require("fetch-mock");

mock(
    "node-fetch",
    fetchMock.sandbox().mock("http://example.com", { body: "Hello, World!" })
);

const main = require("./main");

test("request works", async t => {
    t.plan(2);

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
                            queueResponse: true
                        },
                        rendered: {
                            host: "example.com",
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
                console.log(response);
                t.is(response.requestBody, "test");
                t.is(response.responseBody, "Hello, World!");
                resolve();
            }
        };

        main(broker, {}, console);
    });

    await p;
});
