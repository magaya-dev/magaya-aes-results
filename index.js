const { program } = require("commander");
const packageJson = require("./package.json");
const express = require("express");
const app = express();

program
    .version(packageJson.version)
    .option("-p, --port <n>", "running port", parseInt)
    .option("-r, --root <value>", "startup root for api")
    .option("-s, --service-name <value>", "name for service")
    .option("-g, --gateway", "dictates if we should be through gateway")
    .option("-i, --network-id <n>", "magaya network id", parseInt)
    .option("--connection-string <value>", "connection endpoint for database")
    .option("--no-daemon", "pm2 no daemon option")
    .parse(process.argv);

const options = program.opts();
const root = options.root;
const extension = { company: "magaya", name: "aes-results" };
const extensionId = `${extension.company}-${extension.name}`;

const hyperion = require('@magaya/hyperion-node')(process.argv, { clientId: extensionId });
const dbhelper = require('@magaya/db-helper')(hyperion);
const sockets = require("@magaya/socket-tunnel-node");

const router = require('./routes/router')(dbhelper);

const gatewayAllowed = `${root}/gateway`;
const magayaGateway = "https://appgw.magaya.net/";

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get(`${root}/ping`, async (_, resp) => {
    //resp.redirect(`${gatewayAllowed}/ping`);
    resp.send({ result: 'pong' });
});

app.use(`${gatewayAllowed}`, router);

app.listen(options.port, () => {
    console.log(
        `${new Date()}: ` + "Start listening in port: " + options.port
    );
    if (options.gateway) {
        sockets(
            {
                server: magayaGateway,
                app: "aes-results",
                groupId: options.networkId,
                root: `http://localhost:${options.port}${gatewayAllowed}`,
                retryStrategy: {
                    maxRetries: 3,
                },
            },
            (error, socket) => {
                if (error) {
                    console.log(error);
                    process.exit(1);
                }
                console.log("Gateway enabled...");
            }
        );
    }
});