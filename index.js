module.exports = function failfast(callback, continuation, thisArg) {
  return function(err) {
    if (err) {
      if (callback) callback(err);
      return;
    }
    if (continuation) {
      // avoid copying args for common, low arity scenarios,
      // this performs a bit better than the array slice/copy...
      switch (arguments.length) {
        case 0:
        case 1:
          return continuation.call(thisArg, callback);
        case 2:
          return continuation.call(thisArg, arguments[1], callback);
        case 3:
          return continuation.call(thisArg, arguments[1], arguments[2], callback);
        case 4:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], callback);
        case 5:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], arguments[4], callback);
        case 6:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], callback);
        case 7:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], callback);
        case 8:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], callback);
        case 9:
          return continuation.call(thisArg, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], callback);
        default:
          var capture = Array.prototype.slice.call(arguments, 1);
          if (callback) capture.push(callback);
          return continuation.apply(thisArg, capture);
      }
    }
  };
};
