var globalConfig = require('../../config.js');

module.exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',

    framework: 'cucumber',

    // Spec patterns are relative to this directory.
    specs: [
        'features/**/*.feature'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://0.0.0.0:' + globalConfig.frontend.port,

    allScriptsTimeout: 40000,

    cucumberOpts: {
        tags: ['~@ignore'],
        require: 'steps/*.js',
        format: 'pretty',
        timeout: 20000
    }
};
