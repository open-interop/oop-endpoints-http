const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    endpointsExchangeName: "OOP_ENDPOINTS_EXCHANGE_NAME",
    oopEndpointsQ: "OOP_ENDPOINT_Q",
    requestTimeout: "OOP_REQUEST_TIMEOUT",
    coreResponseQ: "OOP_CORE_RESPONSE_Q"
});
