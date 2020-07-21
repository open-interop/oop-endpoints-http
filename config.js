const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    exchangeName: "OOP_EXCHANGE_NAME",
    oopEndpointsQ: "OOP_ENDPOINT_Q",
    httpOutputQ: "OOP_ENDPOINTS_HTTP_OUTPUT_Q",
    requestTimeout: "OOP_REQUEST_TIMEOUT",
    maxRetryAttempts: "OOP_ENDPOINTS_HTTP_MAX_RETRIES"
});
