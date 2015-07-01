/*global require,protractor,element,by*/
var Promise = require('bluebird');
var config = require('../../../config.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;
var fragments = require('./fragments.js');

var openWindowDelay = 1000;

module.exports = function () {
    'use strict';

    function clearAndType(webElement, text) {
        text = text.replace(/\\n/g, protractor.Key.ENTER);
        return webElement.getAttribute('type').then(function (type) {
            if ('date' !== type) {
                return webElement.clear().then(function () {
                    return webElement.sendKeys(text);
                });
            } else {
                return webElement.sendKeys(text);
            }
        });
    }

    this.Then(/^pause$/, function (callback) {
        browser.pause();
        callback();
    });

    this.Given(/^I am an anonymous user$/, function (callback) {
        browser.manage().deleteAllCookies();
        callback();
    });

    this.When(/^I browse to the "([^"]*)"$/, function (url, callback) {
        browser.get('/#' + url).then(callback);
    });

    this.Then(/^I should be directed to "([^"]*)"$/, function (url, callback) {
        expect(browser.getCurrentUrl()).to.eventually.match(new RegExp(url.replace('/', '\/').replace('?', '\\?') + '$')).and.notify(callback);
    });

    this.When(/^I sign into oauth provider with valid credentials$/, function (callback) {
        browser.ignoreSynchronization = true;
        return clearAndType(fragments('oauth.username')(), config.credentials.username)
            .then(function () {
                return clearAndType(fragments('oauth.password')(), config.credentials.password)
            }).then(function () {
                return fragments('oauth.login')().click();
            }).then(function () {
                browser.ignoreSynchronization = false;
                callback();
            });
    });

    this.Then(/^Browser url should match "(.*)"$/, function (url, callback) {
        browser.ignoreSynchronization = true;
        expect(browser.getCurrentUrl()).to.eventually.equal(url).and.notify(function () {
            browser.ignoreSynchronization = false;
            callback();
        });
    });

    this.When(/^I sign into oauth provider with invalid credentials$/, function (callback) {
        browser.ignoreSynchronization = true;
        return clearAndType(fragments('oauth.username')(), config.credentials.username + ' ' + config.credentials.username)
            .then(function () {
                return clearAndType(fragments('oauth.password')(), config.credentials.password + ' ' + config.credentials.password)
            }).then(function () {
                return fragments('oauth.login')().click();
            }).then(function () {
                browser.ignoreSynchronization = false;
                callback();
            });
    });

    this.When(/^I click "([^"]*)"$/, function (name, callback) {
        browser.actions().mouseMove(fragments(name)()).perform().then(function () {
            fragments(name)().click().then(function () {
                return browser.waitForAngular();
            }).then(callback);
        });
    });

    this.When(/^I click oauth signin button$/, function (callback) {
        browser.ignoreSynchronization = true;
        var name = 'home.oauthSigninButton';
        browser.actions().mouseMove(fragments(name)()).perform().then(function () {
            fragments(name)().click().then(callback);
        });
    });

    function callResourceApi(url) {
        var mainHandle = browser.getWindowHandle();
        return browser.executeScript(function (url, openWindowDelay) {
            var handle = window.open(url);
            window.setTimeout(function () {
                handle.close();
            }, openWindowDelay);
        }, url, openWindowDelay).then(function () {
                return browser.switchTo().window(mainHandle);
            })
    }

    this.When(/^Access token expired$/, function (callback) {
        callResourceApi('http://localhost:'+config.resource.port+'/force401')
            .then(function (resul) {
                return browser.driver.sleep(openWindowDelay);
            }).then(callback);
    });

    this.When(/^Access token is valid$/, function (callback) {
        fragments('home.accessToken')().getWebElement().getAttribute('value').then(function (accessToken) {
            var url = 'http://localhost:'+config.resource.port+'/valid-access-token?accessToken=' + accessToken;
            return callResourceApi(url).then(function () {
                return callResourceApi('http://localhost:'+config.resource.port+'/force401/revoke')
            }).then(function (result) {
                    return browser.driver.sleep(openWindowDelay);
                });
        }).then(callback)
    });

    this.Then(/^I should see "([^"]*)"$/, function (name, callback) {
        expect(fragments(name)().getWebElement().isDisplayed()).to.eventually.be.true.and.notify(callback);
    });

    this.Then(/^I should see "(.*)" in "([^"]*)"$/, function (text, name, callback) {
        text = text.replace(/\\n/g, '\n');
        expect(fragments(name)().getWebElement().getText()).to.eventually.equal(text).and.notify(callback);
    });

    this.Then(/^I should not see "([^"]*)"$/, function (name, callback) {
        fragments(name)().isPresent().then(function (result) {
            if (result) {
                expect(fragments(name)().isDisplayed()).to.eventually.be.false.and.notify(callback);
            } else {
                expect(Promise.resolve(result)).to.eventually.be.false.and.notify(callback);
            }
        });
    });

};
