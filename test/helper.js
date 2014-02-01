var gutil = require('gulp-util');

module.exports.should = require('should');

Function.prototype.expectFail = function (expectedError) {
  var _this = this;
  return function (err) {
    if (err) {
      if (expectedError) {
        try {
          var message = err.message || err;
          if (typeof expectedError === 'string') {
            message.should.equal(expectedError);
          } else if (typeof expectedError === 'function') {
            expectedError(err);
          } else if (expectedError instanceof RegExp) {
            message.should.match(expectedError);
          }
        } catch (e) {
          _this(e);
          return;
        }
      }
      _this();
    } else {
      _this(new Error('Testing should fail'));
    }
  };
};

module.exports.createFile = function (relpath, contents) {
  if (typeof contents === 'string') {
    contents = new Buffer(contents);
  }
  return new gutil.File({
    cwd: '/test/',
    base: '/test/',
    path: '/test/' + relpath,
    contents: contents ? contents : null
  });
};

gutil.log.capture = function (block, callback) {
  var logs = [];
  var cleaned = false;

  var original = gutil.log;
  gutil.log = function () {
    var args = Array.prototype.slice.call(arguments);
    var log = args.map(function (arg) { return arg.toString() }).join(' ');
    log = gutil.colors.stripColor(log);
    logs.push(log);
    return this;
  };

  var cleanUp = function (error) {
    if (cleaned) return;
    gutil.log = original;
    cleaned = true;
    callback && callback(error, logs);
  };

  try {
    if (block.length === 0) {
      block();
      cleanUp();
    } else {
      block(cleanUp);
    }
  } catch (e) {
    cleanUp(e);
  }
};