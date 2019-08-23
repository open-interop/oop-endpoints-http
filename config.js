const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.OOP_AMQP_ADDRESS,
    endpointsExchangeName: process.env.OOP_ENDPOINTS_EXCHANGE_NAME,
    oopEndpointsQ: process.env.OOP_ENDPOINT_Q
};
