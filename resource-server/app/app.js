var bodyParser = require('body-parser');
var express = require('express');

var app = express();
app.use(bodyParser.json());

var force401 = false;
var validAccessToken;

app.get('/resource', function (request, response) {
    if (force401) {
        response.status(401).end();
        return;
    }
    if (null == request.headers.authorization) {
        response.status(401).end();
        return;
    }
    var accessToken = request.headers.authorization.substring('Bearer '.length);
    if (validAccessToken !== accessToken) {
        response.status(401).end();
        return;
    }
    response.send({name: 'box'})
});
app.get('/force401', function (request, response) {
    force401 = true;
    response.end();
});
app.get('/valid-access-token', function (request, response) {
    if (null == request.query.accessToken) {
        response.status(412).send('accessToken is required in JSON payload');
    }
    validAccessToken = request.query && request.query.accessToken;
    response.end();
});
app.get('/force401/revoke', function (request, response) {
    force401 = false;
    response.end();
});


module.exports = app;
