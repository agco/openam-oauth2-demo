var bodyParser = require('body-parser');
var Promise = require('bluebird');
var url = require('url');
var querystring = require('querystring');
var express = require('express');
var chai = require('chai');
var expect = chai.expect;
var supertest = require('supertest');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.request.addPromises(Promise);
var config = require('../../config.js');
var createApp = require('../app/app.js');
var chaiRequest;

describe('Backend app', function () {

    var backendServer;
    var frontendServer;
    var oauthServer;
    var backendPort = config.backendPort;

    before(function (done) {
        config.oauth.authorizationURL = 'http://localhost:' + config.oauth.port + '/authorize';
        config.oauth.tokenURL = 'http://localhost:' + config.oauth.port + '/api/access_token';
        /**
         * Setup oauth2 server
         */
        var oauthApp = express();
        oauthApp.use(bodyParser.urlencoded({extended: true}));
        oauthApp.get('/authorize', function (request, response) {
            response.send('Here is the form');
        });
        oauthApp.post('/api/login', function (request, response) {
            response.redirect(request.body.redirect_uri + '?code=abc');
        });
        oauthApp.post('/api/access_token', function (request, response) {
            if ('abc' === request.body.code) {
                response.send({access_token: 'abc123'});
            } else {
                response.status(401).end();
            }
        });
        oauthServer = oauthApp.listen(config.oauth.port);
        /**
         * Setup frontend
         */
        var frontendApp = express();
        frontendApp.get('/', function (request, response) {
            response.send('OK');
        });
        frontendServer = frontendApp.listen(config.frontend.port);
        /**
         * Setup backend
         */
        var app = createApp(config.frontend.successUrl, config.frontend.failureUrl);
        backendServer = app.listen(backendPort, done);
        chaiRequest = chai.request('http://localhost:' + backendPort);
    });

    after(function () {
        backendServer.close();
        frontendServer.close();
        oauthServer.close();
    });

    describe('GET /auth', function () {
        it('should redirect client to oauth2 server', function () {
            return chaiRequest.get('/auth').then(function (response) {
                expect(response).to.have.status(200);
                var parsedUrl = url.parse(response.req.path);
                expect(parsedUrl).to.have.property('pathname', '/authorize');
                var parsedQuery = querystring.parse(parsedUrl.query);
                expect(parsedQuery).to.have.property('response_type', 'code');
                expect(parsedQuery).to.have.property('client_id', config.oauth.clientID);
                expect(parsedQuery).to.have.property('redirect_uri', config.oauth.callbackURL);
            });
        });
    });

    describe('GET /', function () {

        describe('when code is valid', function () {
            it('should redirect to succsessful frontend url', function (done) {
                var data = {
                    redirect_uri: config.oauth.callbackURL,
                    username: config.credentials.username,
                    password: config.credentials.password
                };
                var baseUrl = url.parse(config.oauth.authorizationURL);
                baseUrl.pathname = '';
                baseUrl = url.format(baseUrl);
                supertest(baseUrl).post('/api/login').type('form').send(data).redirects(2).end(function (err, response) {
                    expect(response).not.to.be.undefined;
                    expect(response.request.url).to.equal(config.frontend.successUrl);
                    done();
                });
            });
        });
        describe('when code is invalid', function () {
            it('should redirect to failure frontend url', function (done) {
                chaiRequest.get('/').query('code=123').redirects(1).end(function (err, response) {
                    expect(response).to.have.status(200);
                    expect(response.redirects[0]).to.equal(config.frontend.failureUrl);
                    done();
                });
            });
        });

    });
});
