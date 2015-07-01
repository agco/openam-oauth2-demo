/*jshint camelcase:false*/

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    'use strict';

    var LIVERELOAD_PORT = 35728;

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-protractor-webdriver');

    grunt.initConfig({
        watch: {
            js: {
                files: ['app/scripts/{,*/}*.js'], tasks: [], options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'app/index.html',
                    'app/**/*.html'
                ]
            }
        },
        connect: {
            options: {
                port: process.env.PORT || 8000,
                hostname: '*'
            },
            livereload: {
                options: {
                    open: true, middleware: function (connect) {
                        return [
                            connect['static'](require('path').resolve('app')),
                            require('grunt-connect-proxy/lib/utils').proxyRequest
                        ];
                    }
                }
            },
            proxies: [
                {
                    context: '/api',
                    host: grunt.option('backend-host') || 'localhost',
                    port: grunt.option('backend-port') || 8080,
                    rewrite: {
                        '^/api': ''
                    }
                }
            ]
        },
        protractor_webdriver: {
            driver: {
                options: {
                }
            }
        },
        protractor: {
            options: {
                configFile: 'test/config.js',
                keepAlive: false,
                noColor: false
            },
            chrome: {
                options: {
                    args: {
                        browser: 'chrome'
                    }
                }
            },
            firefox: {
                options: {
                    args: {
                        browser: 'firefox'
                    }
                }
            }
        }

    });

    grunt.registerTask('serve', [
        'configureProxies:server', 'connect:livereload', 'watch'
    ]);

    grunt.registerTask('test', [
        'protractor_webdriver', 'protractor:chrome'
    ]);

    grunt.registerTask('test:firefox', [
        'protractor_webdriver', 'protractor:firefox'
    ]);

};
