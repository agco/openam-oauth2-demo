var app = require('./app.js');
var config = require('../../config.js');

/**
 * Don't panic, OpenAM SSL cert is not signed by any big guy
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var port = config.backendPort;

app(config.frontend.successUrl, config.frontend.failureUrl).listen(port);
console.info('Listening on port', port);
