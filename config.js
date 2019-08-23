const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.AMQP_ADDRESS,
    endpointsExchangeName: process.env.ENDPOINTS_EXCHANGE_NAME,
    oopEndpointsQ: process.env.OOP_ENDPOINTS_Q
};
