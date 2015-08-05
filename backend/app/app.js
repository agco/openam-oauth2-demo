var _ = require('lodash');
var url = require('url');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var express = require('express');
var httpAsPromised = require('http-as-promised');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');
var refresh = require('passport-oauth2-refresh');
var config = require('../../config.js');

function createApp(frontendSuccessUrl, frontendErrorUrl) {
    var strategy = new OAuth2Strategy(config.oauth,
        function (accessToken, refreshToken, profile, done) {
            done(null, {username: 'Monkey', accessToken: accessToken, refreshToken: refreshToken});
        }
    );
    strategy._oauth2.getAuthorizeUrl = function (params) {
        params = params || {};
        params['client_id'] = this._clientId;
        var parsedUrl = url.parse(this._baseSite + this._authorizeUrl);
        var query = querystring.parse(parsedUrl.query);
        _.extend(query, params, {scope: config.oauth.scope});
        parsedUrl.search = '?' + querystring.stringify(query);
        return  url.format(parsedUrl);
    };
    passport.use(strategy);
    refresh.use(strategy);

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function (user, done) {
        done(null, {username: user});
    });

    var app = express();

    app.use(passport.initialize());
    app.use(cookieParser());

    app.get('/refresh', function (req, res) {
        var refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            console.warn('No refresh token to refresh');
            res.sendStatus(401);
            return;
        }
        refresh.requestNewAccessToken('oauth2', refreshToken, function (err, accessToken) {
            if (err) {
                console.error(err && err.stack || err);
                res.sendStatus(401);
                return;
            }
            res.cookie('access_token', accessToken);
            res.sendStatus(200);
        });
    });

    app.get('/auth', passport.authenticate('oauth2'));
    /**
     * Normally this route should be `/auth/callback` but OpenAM has registered `/`
     */
    app.get('/',
        function (req, res, next) {

            passport.authenticate('oauth2', {  failureRedirect: frontendErrorUrl, failureFlash: true },
                function (err, user) {
                    if (err) {
                        if (err.oauthError && 401 === err.oauthError.statusCode) {
                            console.error(err.message);
                            res.redirect(frontendErrorUrl);
                            return;
                        }
                        next(err);
                        return;
                    }
                    res.cookie('access_token', user.accessToken);
                    res.cookie('refresh_token', user.refreshToken);
                    res.redirect(frontendSuccessUrl);
                }
            )(req, res, next)
        }
    );
    app.get('/resource', function (request, response) {
        var headers = {authorization: 'Bearer ' + request.cookies.access_token};
        httpAsPromised({url: 'http://localhost:9002/resource', headers: headers}).then(function (result) {
            response.send(result[1]);
        }).catch(function (error) {
                response.status(error.statusCode).end();
            });
    });

    return app;
}

module.exports = createApp;
