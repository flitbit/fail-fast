var util = require('util');
var request = require('request');
var failfast = require('../')

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

timedRequest('https://www.npmjs.com/search?q=fail-fast', function(err, res, body) {
  // ... do something with the response ...
});

timedRequest('https://www.google.com', function(err, res, body) {
  // ... do something with the response ...
});
