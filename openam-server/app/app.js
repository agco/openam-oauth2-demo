var bodyParser = require('body-parser');
var express = require('express');
var url = require('url');
var querystring = require('querystring');
var crypto = require('crypto');
var config = require('../../config.js');


var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'jade');

var accessTokens = {};

app.get('/', function (request, response) {
    var parsedUrl = url.parse(request.url);
    parsedUrl.pathname = '/authorize';
    response.redirect(url.format(parsedUrl));
});

app.get('/authorize', function (request, response) {
    var redirect_uri = request.query.redirect_uri;
    if (null == redirect_uri) {
        response.status(412).send('Missing redirect_uri param');
    } else {
        response.render('index', {redirect_uri: redirect_uri});
    }
});

app.post('/api/login', function (request, response) {
    var payload = request.body || {};
    if (null == payload || config.credentials.username !== payload.username || config.credentials.password !== payload.password) {
        response.render('index', {invalidPassword: true, redirect_uri: request.body.redirect_uri});
        return;
    }
    var redirectUri = url.parse(payload.redirect_uri);
    redirectUri.query = redirectUri.query || {};
    var code = crypto.createHash('md5').update(new Date().getTime() + '').digest('hex');
    var parsedQuery = querystring.parse(redirectUri.query);
    parsedQuery.code = code;
    redirectUri.search = '?' + querystring.stringify(parsedQuery);
    accessTokens[code] = crypto.createHash('md5').update(new Date().toISOString()).digest('hex');

    response.redirect(url.format(redirectUri));
});

app.post('/api/access_token', function (request, response) {
    var accessToken = accessTokens[request.body.code];
    if (null != accessToken) {
        response.send({access_token: accessToken});
    } else {
        response.status(401).end();
    }

});

module.exports = app;
