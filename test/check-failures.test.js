var test = require('tape');
var ftpStream = require('..');
var runFtpServer = require('./run-ftp-server');
var through2 = require('through2');

function createDrain() {
  return through2.obj(function(file, enc, callback){
    file.contents.pipe(through2(function(chunk, enc, cb){cb();},
                                function(){callback();}));
  });
}

test('stream should emit error when file not found', function (t) {
  t.plan(1);

  var server = runFtpServer();
  function done(error) {
    if(!error) {
      t.fail('error should have happend')
    } else {
      t.equal(error.message, "File Not Found: fileX.txt");
    }
    server.completelyShutdown();
    t.end();
  }

  var file = 'fileX.txt';

  var s = ftpStream({port:2100}, file)
  .on('error', done)
  .pipe(createDrain())
  .on('finish', done);
});


test('stream should emit error when incorrect credentials', function (t) {
  t.plan(1);

  var server = runFtpServer({enableAuth: true});
  function done(error) {
    if(!error) {
      t.fail('error should have happend')
    } else {
      t.equal(error.message, "Not logged in.");
    }
    server.completelyShutdown();
    t.end();
  }

  var file = 'file.txt';

  var s = ftpStream({port:2100}, file)
  .on('error', done)
  .pipe(createDrain())
  .on('finish', done);
});

test('stream should emit error when incorrect host', function (t) {
  t.plan(1);

  function done(error) {
    if(!error) {
      t.fail('error should have happend')
    } else {
      t.equal(error.message, "connect ECONNREFUSED");
    }
    t.end();
  }

  var file = 'file.txt';

  var s = ftpStream({port:2100}, file)
  .on('error', done)
  .pipe(createDrain())
  .on('finish', done);
});

