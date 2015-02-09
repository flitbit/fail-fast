var failfast = require('../');
var util = require('util');
var expect = require('expect.js');
var request = require('request');
var uuid = require('node-uuid');

describe('fail-fast', function() {

  function immediateError(callback) {
    callback(new Error('immediate'));
  }

  it('errors are communicated to the callback',
    function(done) {
      immediateError(
        failfast(function(err) {
          expect(err.message).to.be('immediate');
          done();
        }, function(unexpected) {
          done(new Error('should not be called due to error'));
        }));
    });

  it('errors are communicated to the callback (when no continuation)',
    function(done) {
      immediateError(
        failfast(function(err) {
          expect(err.message).to.be('immediate');
          done();
        }));
    });

  it('no callback and no continuation is benign (results are eaten)',
    function() {
      immediateError(failfast());
    });

  it('callback is forwarded to continuation',
    function(done) {
      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback without an error.
        setTimeout(
          function() {
            callback();
          }, 100);
      }
      test(failfast(done, function(cb) {
        // callback is mocha's done method.
        cb();
      }));
    });

  it('continuation is forwarded response argument (arity/1)',
    function(done) {
      var one;

      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback with one argument
        // that should be forwarded to the continuation.
        setTimeout(
          function() {
            one = uuid.v1();
            callback(null, one);
          }, 100);
      }

      test(failfast(done, function(a, cb) {
        expect(a).to.be(one);
        cb();
      }));
    });

  it('continuation is forwarded response arguments (arity/2)',
    function(done) {
      var one, two;

      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback with two arguments
        // that should be forwarded to the continuation.
        setTimeout(
          function() {
            one = uuid.v1();
            two = uuid.v1();
            callback(null, one, two);
          }, 100);
      }

      test(failfast(done, function(a, b, cb) {
        expect(a).to.be(one);
        expect(b).to.be(two);
        cb();
      }));
    });

  it('continuation is forwarded response arguments (arity/3)',
    function(done) {
      var one, two, three;

      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback with three arguments
        // that should be forwarded to the continuation.
        setTimeout(
          function() {
            one = uuid.v1();
            two = uuid.v1();
            three = uuid.v1();
            callback(null, one, two, three);
          }, 100);
      }

      test(failfast(done, function(a, b, c, cb) {
        expect(a).to.be(one);
        expect(b).to.be(two);
        expect(c).to.be(three);
        cb();
      }));
    });

  it('continuation is forwarded response arguments (arity/4)',
    function(done) {
      var one, two, three, four;

      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback with four arguments
        // that should be forwarded to the continuation.
        setTimeout(
          function() {
            one = uuid.v1();
            two = uuid.v1();
            three = uuid.v1();
            four = uuid.v1();
            callback(null, one, two, three, four);
          }, 100);
      }

      test(failfast(done, function(a, b, c, d, cb) {
        expect(a).to.be(one);
        expect(b).to.be(two);
        expect(c).to.be(three);
        expect(d).to.be(four);
        cb();
      }));
    });

  it('continuation is forwarded response arguments (arity/5)',
    function(done) {
      var one, two, three, four, five;

      function test(callback) {
        // this test simulates a delay for processing,
        // then invokes the callback with five arguments
        // that should be forwarded to the continuation.
        setTimeout(
          function() {
            one = uuid.v1();
            two = uuid.v1();
            three = uuid.v1();
            four = uuid.v1();
            five = uuid.v1();
            callback(null, one, two, three, four, five);
          }, 100);
      }

      test(failfast(done, function(a, b, c, d, e, cb) {
        expect(a).to.be(one);
        expect(b).to.be(two);
        expect(c).to.be(three);
        expect(d).to.be(four);
        expect(e).to.be(five);
        cb();
      }));
    });

  it('real-world response forwarded to continuation with `this` context',
    function(done) {

      // The purpose of this class is to verify that
      // when `failfast` is given a context for `this`
      // that the continuation is performed in the
      // provided context.
      function MyRequester() {
        var self = this;

        this.after = function(res, body, callback) {
          expect(this).to.be(self); // verifies context.
          expect(res).to.be.ok();
          expect(body).to.be.a('string');
          // callback is mocha's `done` argument.
          callback();
        };
      }

      var my = new MyRequester();

      request.get(
        'https://www.npmjs.com/search?q=fail-fast',
        failfast(done, my.after, my)
      );
    });

  describe('the weird looking switch-dispatch used by failfast', function() {
    function rand(integerMax) {
      return Math.floor((Math.random() * integerMax) + 1);
    }

    function normalArgumentPropagation(callback, continuation, thisArg) {
      return function(err) {
        if (err) {
          if (callback) callback(err);
          return;
        }
        if (continuation) {
          var capture = Array.prototype.slice.call(arguments, 1);
          if (callback) capture.push(callback);
          return continuation.apply(thisArg, capture);
        }
      };
    }

    function call0(callback) {
      callback();
    }

    function call10(callback) {
      callback(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    }

    function call9(callback) {
      callback(0, 1, 2, 3, 4, 5, 6, 7, 8);
    }

    function call8(callback) {
      callback(0, 1, 2, 3, 4, 5, 6, 7);
    }

    function call7(callback) {
      callback(0, 1, 2, 3, 4, 5, 6);
    }

    function call6(callback) {
      callback(0, 1, 2, 3, 4, 5);
    }

    function call5(callback) {
      callback(0, 1, 2, 3, 4);
    }

    function call4(callback) {
      callback(0, 1, 2, 3);
    }

    function call3(callback) {
      callback(0, 1, 2);
    }

    function call2(callback) {
      callback(0, 1);
    }

    function call1(callback) {
      callback(0);
    }

    var invokes;
    function countInvokes() {++invokes}

    function time(alg, fail) {
      invokes = 0;
      var start = process.hrtime();
      var i = -1,
        count = 100000;
      while (++i < count) {
        call0(alg(fail, countInvokes));
        call1(alg(fail, countInvokes));
        call2(alg(fail, countInvokes));
        call3(alg(fail, countInvokes));
        call4(alg(fail, countInvokes));
        call5(alg(fail, countInvokes));
        call6(alg(fail, countInvokes));
        call7(alg(fail, countInvokes));
        call8(alg(fail, countInvokes));
        call9(alg(fail, countInvokes));
        call10(alg(fail, countInvokes));
      }
      return process.hrtime(start);
    }

    var typicalTime;
    var failfastTime;

    before(function(done) {
      this.timeout(10000); // boost the timeout so slower machines do think it failed.
      typicalTime = time(normalArgumentPropagation, done);
      failfastTime = time(failfast, done);
      done();
    });

    it('failfast has superior performance', function() {
      var typicalMs = (typicalTime[0] * 1000) + (typicalTime[1] / 1000000);
      var failfastMs = (failfastTime[0] * 1000) + (failfastTime[1] / 1000000);
      util.log(util.format("typical  %dms (lower is better) or %d calls per MS (higher is better)", typicalMs, invokes / typicalMs));
      util.log(util.format("failfast %dms (lower is better) or %d calls per MS (higher is better)", failfastMs, invokes / failfastMs));
      expect(failfastTime[0] < typicalTime[0] ||
          (failfastTime[0] === typicalTime[0] &&
            failfastTime[1] < typicalTime[1]))
        .to.be.ok();
    });
  });

});
