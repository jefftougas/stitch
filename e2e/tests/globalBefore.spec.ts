import waitOn = require('wait-on');
import { URL } from 'url';

before('waiting for graphql server', async function () {
    const timeout = Number(process.env.TIMEOUT);
    this.timeout(timeout);
    const { hostname, port, protocol } = new URL(process.env.GRAPHQL_SERVER_URL);

    const explicitPort = port || getImplicitPort(protocol);
    await waitOn({
        log: true,
        verbose: true,
        resources: [
            `tcp:${hostname}:${explicitPort}`,
        ],
        delay: 1000,
        interval: 100,
        timeout,
        window: 1000,
    });
});

const getImplicitPort = protocol => {
    switch (protocol) {
        case 'http:':
            return 80;
        case 'https:':
            return 443;
        default:
    }
}