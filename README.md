OAuth2 demo
===========

# Frontend

Frontend uses it's own set of node_modules and bower_components so

```
[oauth-demo/fronted] npm install
[oauth-demo/fronted] bower install
[oauth-demo/fronted] grunt serve
```

# Running tests

There are mocha tests and cucumber tests. Mocha stuff is meant for module level testing while cucumber is for full integration test.

## Mocha tests

You can either dive into each module and execute `mocha` or execute `mocha` at top level directory

```
[oauth-demo/backend] mocha
[oauth-demo/resource-server] mocha
```

or simply

```
[oauth-demo/] mocha
```

The modules depend on each other heavily so each mocha test suite mocks out the rest of the modules.

# Cucumber tests

To run automated tests with browser and see how everything integrates together you need to start all the modules (in separate terminals),
 and run the cucumber.

```
[oauth-demo/backend] node app
[oauth-demo/resource-server] node app
[oauth-demo/openam-server] node app
```
and finally
```
[oauth-demo/fronted] grunt test
```
or
```
[oauth-demo/fronted] grunt test:firefox
```
