var backendPort = process.env.BACKEND || 8080;
var frontendPort = process.env.FRONTEND_PORT || 8000;
var oauthPort = process.env.OAUTH_PORT || 9001;
var resourcePort = process.env.RESOURCE_PORT || 9002;
module.exports = {
    credentials: {
        username: process.env.USERNAME || 'baba',
        password: process.env.PASSWORD || 'jaga'
    },
    backendPort: backendPort,
    frontend: {
        port: frontendPort,
        successUrl: 'http://localhost:' + frontendPort + '/#/signin-success',
        failureUrl: 'http://localhost:' + frontendPort + '/#/signin-failure'
    },
    oauth: {
        port: oauthPort,
        authorizationURL: process.env.OAUTH_AUTHORIZATION_URL || 'http://localhost:' + oauthPort + '/authorize',
        tokenURL: process.env.OAUTH_ACCESS_TOKEN_URL || 'http://localhost:' + oauthPort + '/api/access_token',
        clientID: process.env.OAUTH_CLIENT_ID || 'abc',
        clientSecret: process.env.OAUTH_CLIENT_SECRET || 'xxx',
        callbackURL: 'http://localhost:' + backendPort + '/',
        scope: process.env.OAUTH_SCOPE || 'cn mail'
    },
    resource: {
        port: resourcePort
    }
};
