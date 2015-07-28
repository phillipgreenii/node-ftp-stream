var test = require('tape');
var ftpStream = require('..');
var runFtpServer = require('./run-ftp-server');
var through2 = require('through2');

test.Test.prototype.hasStreamItemCount = function (s, c, msg, extra) {
    var counter = 0;

    return s.pipe(through2.obj(function(file, enc, callback){
      file.contents.pipe(createDrain());
      counter++;
      callback();
    }, function(){
      this._assert(counter === c,{
          message : msg || 'should have correct count',
          operator : 'hasStreamItemCount',
          actual : counter,
          expected : c,
          extra : extra
      });
    }.bind(this)));
};

function createDrain() {
  return through2(function(chunk, enc, callback){
    callback();
  });
}

test('stream should contain the correct amount of files (when one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var file = 'file0.txt';
  var expectedCount = 1;

  var s = ftpStream({port:2100}, file);

  t.hasStreamItemCount(s, expectedCount)
  .on('finish', done)
  .on('error', done);
});

test('stream should contain the correct amount of files (when array of one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['file0.txt'];
  var expectedCount = files.length;

  var s = ftpStream({port:2100}, files);

  t.hasStreamItemCount(s, expectedCount)
  .on('finish', done)
  .on('error', done);
});

test('stream should contain the correct amount of files (when array of multiple files)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['/file0.txt', '/dir1/file1.txt', '/dir2/file2.txt'];
  var expectedCount = files.length;

  var s = ftpStream({port:2100}, files);

  t.hasStreamItemCount(s, expectedCount)
  .on('finish', done)
  .on('error', done);
});
