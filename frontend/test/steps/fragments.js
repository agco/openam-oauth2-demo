/*global element,by*/
var byString = function (object, fragmentName) {
    'use strict';
    if (!fragmentName || !fragmentName.replace) {
        return null;
    }
    fragmentName = fragmentName.replace(/\[(\w+)\]/g, '($1)');
    fragmentName = fragmentName.replace(/^\./, '');
    var a = fragmentName.split('.');
    while (a.length) {
        var n = a.shift();
        var arrayExpr = n.match(/(\w+)\(([^)]*)\)/);
        if (arrayExpr) {
            object = object[arrayExpr[1]](arrayExpr[2]);
        } else if (n in object) {
            object = object[n];
        } else {
            throw new Error('Undefined fragment "' + n + '" in "' + fragmentName + '"');
        }
    }
    return object;
};

var fragments = function (text) {
    'use strict';

    var mapping = {
        home: {
            refreshToken: element.bind(null, by.id('refreshToken')),
            refreshTokenButton: element.bind(null, by.id('refreshTokenButton')),
            accessToken: element.bind(null, by.id('accessToken')),
            oauthSigninButton: element.bind(null, by.id('oauthSignin')),
            signinSuccess: element.bind(null, by.id('signinSuccess')),
            logout: element.bind(null, by.id('logout')),
            fetchResource: element.bind(null, by.id('fetchResource')),
            resource: element.bind(null, by.id('resource')),
            resourceError: element.bind(null, by.id('resourceError'))
        },
        oauth: {
            username: element.bind(null, by.className('agco-user')),
            password: element.bind(null, by.className('agco-password')),
            login: element.bind(null, by.className('agco-submit-btn'))
        }
    };

    return byString(mapping, text);
};

module.exports = fragments;
