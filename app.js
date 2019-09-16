const oop = require("oop-node-common");
const config = require("./config");
const main = require("./main");

const MessageBroker = oop.MessageBroker;

main(new MessageBroker(config.amqpAddress), config, oop.logger);
