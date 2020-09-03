const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    exchangeName: "OOP_EXCHANGE_NAME",
    endpointsExchangeName: "OOP_ENDPOINTS_EXCHANGE_NAME",
    oopEndpointsQ: "OOP_ENDPOINT_Q",
    httpOutputQ: "OOP_ENDPOINTS_HTTP_OUTPUT_Q",
    requestTimeout: "OOP_REQUEST_TIMEOUT",
    maxRetryAttempts: "OOP_ENDPOINTS_HTTP_MAX_RETRIES",
    multiAccountMode: { name: "OOP_MULTI_ACCOUNT_MODE", optional: true, default: false },
    coreApiUrl: { name: "OOP_CORE_API_URL", optional: true },
    coreToken: { name: "OOP_CORE_TOKEN", optional: true },
    coreAccountUpdateExchange: { name: "OOP_CORE_ACCOUNT_UPDATE_EXCHANGE", optional: true },
});
