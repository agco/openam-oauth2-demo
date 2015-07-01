var Promise = require('bluebird');
var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.request.addPromises(Promise);
var app = require('../app/app.js');
var chaiRequest = chai.request(app);

describe('Resource-server GET /resource', function () {

    describe('when access token is valid', function () {

        var validAccessToken = 'abc123';
        var validAccessTokenHeader = 'Bearer abc123';

        beforeEach(function () {
            var payload = {accessToken: validAccessToken};
            return  chaiRequest.get('/valid-access-token')
                .query(payload)
                .then(function (response) {
                    expect(response).to.have.status(200);
                });
        });

        it('should result in 200', function () {
            return chaiRequest.get('/resource')
                .set('Authorization', validAccessTokenHeader)
                .then(function (response) {
                    expect(response).to.have.status(200);
                    expect(response.body).to.eql({name: 'box'});
                });
        });

        describe('but 401 is forced', function () {

            beforeEach(function () {
                return  chaiRequest.get('/force401')
                    .then(function (response) {
                        expect(response).to.have.status(200);
                    });
            });

            it('should result in 401', function () {
                return chaiRequest.get('/resource')
                    .set('Authorization', validAccessTokenHeader)
                    .then(function (response) {
                        expect(response).to.have.status(401);
                    });
            });
        });

    });

    describe('when access token is NOT valid', function () {

        var validAccessToken = 'abc123';
        var invalidAccessTokenHeader = 'Bearer X';

        beforeEach(function () {
            var payload = {accessToken: validAccessToken};
            return  chaiRequest.get('/valid-access-token')
                .query(payload)
                .then(function (response) {
                    expect(response).to.have.status(200);
                });
        });

        it('should result in 401', function () {
            return chaiRequest.get('/resource')
                .set('Authorization', invalidAccessTokenHeader)
                .then(function (response) {
                    expect(response).to.have.status(401);
                });
        });

    });

    describe('when access token header is missing', function () {

        it('should result in 401', function () {
            return chaiRequest.get('/resource')
                .then(function (response) {
                    expect(response).to.have.status(401);
                });
        });

    });

});
