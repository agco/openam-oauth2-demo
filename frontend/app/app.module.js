(function () {
    'use strict';

    var app = angular.module('app', ['ngCookies']);

    app.controller('AppCtrl', function ($location, $cookies, $http, $interval, $scope) {
        var ctrl = this;

        this.isAuthenticated = function () {
            return null != this.accessToken;
        };

        this.logout = function () {
            delete $cookies.access_token;
            ctrl.accessToken = null;
            $location.path('/');
        };

        this.removeRefreshToken = function () {
            delete $cookies.refresh_token;
            ctrl.refreshToken = null;
        };

        this.refreshAccessToken = function () {
            $http.get('/api/refresh').then(function () {
                var interval = $interval(function () {
                    ctrl.accessToken = $cookies.access_token;
                    $interval.cancel(interval);
                }, 500);
            }).catch(function (error) {
                    console.error(error);
                    ctrl.resourceError = 'There was an error while refreshing access token, logging out...';
                    var interval = $interval(function () {
                        delete ctrl.resourceError;
                        $interval.cancel(interval);
                    }, 3000);
                    ctrl.logout();
                    ctrl.removeRefreshToken();
                });
        };

        this.fetchResource = function () {
            $http.get('/api/resource').then(function (result) {
                ctrl.resource = result.data;
            }).catch(function (error) {
                    console.error(error);
                    ctrl.resourceError = 'There was an error while fetching the resource, logging out...';
                    var interval = $interval(function () {
                        delete ctrl.resourceError;
                        $interval.cancel(interval);
                    }, 3000);
                    ctrl.logout();
                });
        };

        $scope.$on('$locationChangeSuccess', function () {
            delete ctrl.signinSuccess;
            delete ctrl.signinFailure;
            if ('/signin-success' === $location.path()) {
                ctrl.signinSuccess = true;
            } else if ('/signin-failure' === $location.path()) {
                ctrl.signinFailure = true;
            }
        });

        this.accessToken = $cookies.access_token;
        this.refreshToken = $cookies.refresh_token;


    });

})();








