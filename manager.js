const { spawn } = require("child_process");
const fetch = require("node-fetch");
const chalk = require("chalk");

let logger;

const accounts = {};

let globalClose = false;

const setupProcess = account => {
    const { hostname, id } = account;
    const newEnv = { ...process.env };

    const endpointsQueueParts = newEnv.OOP_ENDPOINT_Q.split(".");
    endpointsQueueParts.push(hostname);
    newEnv.OOP_ENDPOINT_Q = endpointsQueueParts.join(".");

    const proc = spawn("node", ["app.js"], { env: newEnv });

    proc.stdout.on("data", data => {
        logger.info(`${hostname}:\n${chalk.blue(data)}`);
    });

    proc.stderr.on("data", data => {
        logger.error(`${hostname}:\n${chalk.blue(data)}`);
    });

    proc.on("close", exitCode => {
        logger.info(`${hostname}: Process Closed. Exit code ${exitCode}.`);

        if (!globalClose) {
            setupProcess(hostname);
        }
    });

    logger.info(`${hostname}: Process Opened.`);
    accounts[id] = proc;
};

const close = () => {
    globalClose = true;


    for (const proc of Object.values(accounts)) {
        proc.kill();
    }

    setTimeout(() => {
        logger.info("Manager Process Exiting");
        process.exit();
    }, 1);
};

const join = (...args) => args.map(p => p.replace(/^\/*(.*?)\/*$/, "$1")).join("/");

const main = async (broker, config, _logger) => {
    logger = _logger;
    const accountList = await fetch(
        join(config.coreApiUrl, "accounts"),
        { headers: { "X-Core-Token": config.coreToken } },
    ).then(res => res.json());

    logger.info("Manager Process Started");

    process.on("SIGINT", close);
    process.on("SIGTERM", close);

    for (const account of accountList) {
        setupProcess(account);
    }

    broker.subscribe(config.coreAccountUpdateExchange, message => {
        const { action, account } = message.content;
        switch (action) {
            case "create":
                setupProcess(account);
                break;

            case "update":
                accounts[account.id].kill();
                delete accounts[account.id];

                setupProcess(account);
                break;

            case "delete":
                accounts[account.id].kill();
                delete accounts[account.id];
                break;

            default:
                logger.error(`Unknown account update action: "${action}".`);
                break;
        }
    });
};

module.exports.main = main;
