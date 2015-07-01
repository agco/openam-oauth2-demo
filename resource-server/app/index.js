var app = require('./app.js');
var config = require('../../config.js');

var port = config.resource.port;
app.listen(port);
console.info('Listening on port', port);
