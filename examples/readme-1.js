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

timedRequest('https://www.npmjs.com/search?q=fail-fast', function(err, res, body) {
  // ... do something with the response ...
});

timedRequest('https://www.google.com', function(err, res, body) {
  // ... do something with the response ...
});
