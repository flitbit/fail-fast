#fail-fast

A failfast module for idiomatic nodejs splitting error handling from successful continuation.

I recognize that it is a matter of style, but I prefer to deal primarily with the success case and let errors either fall into error-handlers or crash the app. That said, I've used code similar to this `failfast` function in the past to split off errors and decided it was 'bout time I made it its own thing.

## Example
```javascript
var util = require('util');
var request = require('request');

function timedRequest(uri, callback) {
  var hrstart = process.hrtime();

  request.get(uri,
    function(err, res, body) {
      if (err) {
        return callback(err);
      }
      var hrend = process.hrtime(hrstart);
      util.log(util.format("%ds %dms %d GET %s", hrend[0], hrend[1] / 1000000, res.statusCode, uri));
      callback(null, res, body);
    });
}

```

... _becomes_ ...


```javascript
var util = require('util');
var request = require('request');
var failfast = require('fail-fast')

function timedRequest(uri, callback) {
  var hrstart = process.hrtime();

  request.get(uri,
    failfast(callback,
      function(res, body, cb) {
        var hrend = process.hrtime(hrstart);
        util.log(util.format("%ds %dms %d GET %s", hrend[0], hrend[1] / 1000000, res.statusCode, uri));
        cb(null, res, body);
      }));
}
```

## Install

```bash
npm install fail-fast
```

## Test

```bash
npm test
```

... _or_ ...

```bash
mocha -R spec
```

To generate code-coverage of tests, run:

```bash
mocha --require blanket -R html-cov > coverage.html
```

You'll find the coverage report in the file `coverage.html`.


## `failfast`

`failfast` is a function that takes the following arguments:

* `callback` - (optional) the callback function that failfast will split error handling for,
* `continuation` - (optional) a function where successful continuation proceeds,
* `thisArg` - (optional) an object that will be used as the continuation's `this` context.

If you call provide no arguments to `failfast`, it will be benign (although it will still add overhead).

If `callback` is specified, it is invoked when failfast receives a _truthy_ argument in position 0.

If `continuation` is specified, it is invoked when `failfast` receives a _falsy_ argument in position 0. If `callback` was also specified, it is provided as the last argument to `continuation`. Any arguments beyond position 0 (the `err` argument) are forwarded in order to the specified `continuation`.

If `thisArg` is specified, it is bound to the `this` parameter when `continuation` is invoked.

### A note about performance

Any time you extend the call stack you impact performance. An intermediary callback like `failfast` is no exception. Depending on your scenario the slight overhead may be acceptable - this is something you have to decide for yourself.

`failfast` is written in a manner that tries to minimize the overhead. Notably, it uses a technique I call `switch-dispatch`, which is similar to techniques taken by compilers and optimizers; it leverages what we already know, and produces a jump table to avoid copying the array of arguments. `switch-dispatch` would probably make you puke if you had to write it everywhere, but the performance is sweet.
