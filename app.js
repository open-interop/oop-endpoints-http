const oop = require("oop-node-common");
const config = require("./config");
const main = require(config.multiAccountMode ? "./manager" : "./main");

const MessageBroker = oop.MessageBroker;

main(new MessageBroker(config.amqpAddress), config, oop.logger);
