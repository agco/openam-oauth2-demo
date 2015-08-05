var app = require('./app.js');
var config = require('../../config.js');

/**
 * This is in case you intend to use this demo against aaad.agcocorp.com
 */
require('ssl-root-cas')
    .inject()
    .addFile(__dirname + '/../ssl/DigiCertHighAssuranceEVRootCA.pem')
    .addFile(__dirname + '/../ssl/DigiCertSHA2HighAssuranceServerCA.pem');

var port = config.backendPort;

app(config.frontend.successUrl, config.frontend.failureUrl).listen(port);
console.info('Listening on port', port);
