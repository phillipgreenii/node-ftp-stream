var test = require('tape');
var ftpStream = require('..');
var path = require('path');
var fs = require('fs');
var streamEqual = require('stream-equal');
var through2 = require('through2');

var runFtpServer = require('./run-ftp-server');

test.Test.prototype.hasStreamWithStreams = function (parentStreams, expectedChildStreams, msg, extra) {
    var counter = 0;
    var assert = this._assert;

    return parentStreams.pipe(through2.obj(function(file, enc, callback){
      var c = counter++;
      streamEqual(expectedChildStreams[c], file.contents, function(err, equal) {
        assert(equal, {
            message : 'streams for ' + file.path + ' are equal',
            operator : 'streamsMatch',
            extra : extra
        });
        callback(err);
      });
    }));
};

test('stream should contain the correct contents (when one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var file = 'file0.txt';
  var s = ftpStream({port:2100}, file);
  var expectedStreams = [fs.createReadStream(path.join(__dirname, 'data', 'file0.txt'))];

  t.hasStreamWithStreams(s, expectedStreams)
  .on('finish', done)
  .on('error', done);
});

test('stream should contain the correct contents (when array of one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['file0.txt'];
  var s = ftpStream({port:2100}, files);
  var expectedStreams = [fs.createReadStream(path.join(__dirname, 'data', 'file0.txt'))];

  t.hasStreamWithStreams(s, expectedStreams)
  .on('finish', done)
  .on('error', done);
});

test('stream should contain the correct contents (when array of multiple files)', function (t) {
  t.plan(4);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['/file0.txt', '/dir1/file1.txt', '/dir2/file2.txt'];
  var s = ftpStream({port:2100}, files);
  var expectedStreams = [
    fs.createReadStream(path.join(__dirname, 'data', 'file0.txt')),
    fs.createReadStream(path.join(__dirname, 'data', 'dir1', 'file1.txt')),
    fs.createReadStream(path.join(__dirname, 'data', 'dir2', 'file2.txt'))];

  t.hasStreamWithStreams(s, expectedStreams)
  .on('finish', done)
  .on('error', done);
});
